import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  Not,
  Between,
  LessThan,
  MoreThan,
  QueryFailedError,
} from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { Professional } from '../professional/entities/professional.entity';
import { Service } from '../service/entities/service.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

/** Código de violação de constraint UNIQUE no Postgres */
const PG_UNIQUE_VIOLATION = '23505';

/** Transições de status permitidas */
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Professional)
    private readonly professionalRepository: Repository<Professional>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  // ============================================================================
  // HELPERS PRIVADOS
  // ============================================================================

  /**
   * Determina o tenantId efetivo para a operação.
   * - tenant_admin: usa o tenant do próprio usuário
   * - super_admin: exige tenantId explícito no DTO
   */
  private getTenantId(user: any, dtoTenantId?: number): number {
    if (user.role === 'tenant_admin') {
      if (!user.tenantId) {
        throw new ForbiddenException('Usuário não associado a um tenant');
      }
      return user.tenantId;
    }

    if (user.role === 'super_admin') {
      if (!dtoTenantId) {
        throw new BadRequestException(
          'tenantId é obrigatório para super admin',
        );
      }
      return dtoTenantId;
    }

    throw new ForbiddenException('Papel sem permissão');
  }

  /**
   * Valida que o profissional pertence ao tenant e está ativo.
   */
  private async validateProfessional(
    tenantId: number,
    professionalId: number,
  ): Promise<Professional> {
    const professional = await this.professionalRepository.findOne({
      where: { id: professionalId, tenant_id: tenantId, is_active: true },
    });
    if (!professional) {
      throw new NotFoundException('Profissional não encontrado');
    }
    return professional;
  }

  /**
   * Valida que o serviço pertence ao tenant e está ativo.
   */
  private async validateService(
    tenantId: number,
    serviceId: number,
  ): Promise<Service> {
    const service = await this.serviceRepository.findOne({
      where: { id: serviceId, tenant_id: tenantId, is_active: true },
    });
    if (!service) {
      throw new NotFoundException('Serviço não encontrado');
    }
    return service;
  }

  /**
   * Verifica se há conflito de horário com outro agendamento (mesmo tenant).
   * @param ignoreId ID a ignorar (usado em updates)
   */
  private async checkConflict(
    tenantId: number,
    professionalId: number,
    start: Date,
    end: Date,
    ignoreId?: number,
  ): Promise<void> {
    const where: any = {
      tenant_id: tenantId,
      professional_id: professionalId,
      status: Not('cancelled'),
      start_time: LessThan(end),
      end_time: MoreThan(start),
    };

    const conflict = await this.appointmentRepository.findOne({ where });
    if (conflict && conflict.id !== ignoreId) {
      throw new ConflictException('Horário não disponível');
    }
  }

  /**
   * Converte QueryFailedError (unique violation) em ConflictException.
   */
  private handleUniqueViolation(error: unknown): never {
    if (
      error instanceof QueryFailedError &&
      (error as any).driverError?.code === PG_UNIQUE_VIOLATION
    ) {
      throw new ConflictException('Horário não disponível');
    }
    throw error;
  }

  // ============================================================================
  // CRUD
  // ============================================================================

  async create(
    dto: CreateAppointmentDto,
    user: any,
  ): Promise<Appointment> {
    const tenantId = this.getTenantId(user, dto.tenantId);

    await this.validateProfessional(tenantId, dto.professionalId);
    const service = await this.validateService(tenantId, dto.serviceId);

    const start = new Date(dto.startTime);
    if (isNaN(start.getTime())) {
      throw new BadRequestException('Data/hora de início inválida');
    }
    const end = new Date(start.getTime() + service.duration_minutes * 60000);

    await this.checkConflict(tenantId, dto.professionalId, start, end);

    const appointment = this.appointmentRepository.create({
      tenant_id: tenantId,
      professional_id: dto.professionalId,
      service_id: dto.serviceId,
      customer_name: dto.customerName,
      customer_contact: dto.customerContact,
      start_time: start,
      end_time: end,
      status: dto.status || 'pending',
      notes: dto.notes,
    });

    try {
      return await this.appointmentRepository.save(appointment);
    } catch (error) {
      this.handleUniqueViolation(error);
    }
  }

  async findAll(
    user: any,
    filters?: {
      professionalId?: number;
      serviceId?: number;
      date?: string;
      page?: number;
      limit?: number;
    },
  ): Promise<{
    items: Appointment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const where: any = {};
    if (user.role === 'tenant_admin') {
      where.tenant_id = user.tenantId;
    } else if (user.role === 'super_admin') {
      // super_admin vê tudo
    } else {
      throw new ForbiddenException('Papel sem permissão');
    }

    if (filters?.professionalId) where.professional_id = filters.professionalId;
    if (filters?.serviceId) where.service_id = filters.serviceId;
    if (filters?.date) {
      const startOfDay = new Date(`${filters.date}T00:00:00`);
      const endOfDay = new Date(`${filters.date}T23:59:59`);
      where.start_time = Between(startOfDay, endOfDay);
    }

    const page = Math.max(1, filters?.page ?? 1);
    const limit = Math.min(100, Math.max(1, filters?.limit ?? 20));
    const skip = (page - 1) * limit;

    const [items, total] = await this.appointmentRepository.findAndCount({
      where,
      relations: ['professional', 'service', 'service_option'],
      order: { start_time: 'ASC' },
      skip,
      take: limit,
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findOne(id: number, user: any): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['professional', 'service', 'service_option'],
    });
    if (!appointment) {
      throw new NotFoundException(`Agendamento com ID ${id} não encontrado`);
    }
    if (
      user.role === 'tenant_admin' &&
      appointment.tenant_id !== user.tenantId
    ) {
      throw new ForbiddenException('Acesso negado');
    }
    return appointment;
  }

  async update(
    id: number,
    dto: UpdateAppointmentDto,
    user: any,
  ): Promise<Appointment> {
    const appointment = await this.findOne(id, user);
    const tenantId = appointment.tenant_id;

    // ============ Reagendamento (startTime) ============
    if (dto.startTime) {
      const newStart = new Date(dto.startTime);
      if (isNaN(newStart.getTime())) {
        throw new BadRequestException('Data/hora de início inválida');
      }

      const service = await this.serviceRepository.findOne({
        where: { id: appointment.service_id },
      });
      if (!service) {
        throw new NotFoundException('Serviço do agendamento não encontrado');
      }

      const newEnd = new Date(
        newStart.getTime() + service.duration_minutes * 60000,
      );

      await this.checkConflict(
        tenantId,
        appointment.professional_id,
        newStart,
        newEnd,
        id,
      );

      appointment.start_time = newStart;
      appointment.end_time = newEnd;
    }

    // ============ Mudança de profissional ============
    if (
      dto.professionalId !== undefined &&
      dto.professionalId !== appointment.professional_id
    ) {
      await this.validateProfessional(tenantId, dto.professionalId);
      appointment.professional_id = dto.professionalId;
    }

    // ============ Mudança de serviço ============
    if (
      dto.serviceId !== undefined &&
      dto.serviceId !== appointment.service_id
    ) {
      await this.validateService(tenantId, dto.serviceId);
      appointment.service_id = dto.serviceId;
    }

    // ============ Transição de status ============
    if (dto.status !== undefined && dto.status !== appointment.status) {
      const allowed = ALLOWED_TRANSITIONS[appointment.status] || [];
      if (!allowed.includes(dto.status)) {
        throw new BadRequestException(
          `Não é possível alterar o status de "${appointment.status}" para "${dto.status}".`,
        );
      }
      appointment.status = dto.status;
    }

    // ============ Campos editáveis ============
    if (dto.customerName !== undefined) {
      appointment.customer_name = dto.customerName;
    }
    if (dto.customerContact !== undefined) {
      appointment.customer_contact = dto.customerContact;
    }
    if (dto.notes !== undefined) {
      appointment.notes = dto.notes;
    }

    try {
      return await this.appointmentRepository.save(appointment);
    } catch (error) {
      this.handleUniqueViolation(error);
    }
  }

  async remove(id: number, user: any): Promise<void> {
    await this.findOne(id, user);
    const result = await this.appointmentRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Agendamento com ID ${id} não encontrado`);
    }
  }
}