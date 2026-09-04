import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Not, IsNull, LessThan, MoreThan } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { Professional } from '../professional/entities/professional.entity';
import { Service } from '../service/entities/service.entity';
import { WorkSchedule } from '../professional/entities/work-schedule.entity';
import { TenantConfig } from '../tenant/entities/tenant-config.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Professional)
    private readonly professionalRepository: Repository<Professional>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(WorkSchedule)
    private readonly workScheduleRepository: Repository<WorkSchedule>,
    @InjectRepository(TenantConfig)
    private readonly tenantConfigRepository: Repository<TenantConfig>,
  ) { }

  // ============ MÉTODOS AUXILIARES ============

  private getTenantId(user: any, dtoTenantId?: number): number {
    let tenantId: number | null | undefined;

    if (user.role === 'tenant_admin') {
      tenantId = user.tenantId;
      if (!tenantId) throw new ForbiddenException('Usuário não associado a um tenant');
    } else if (user.role === 'super_admin') {
      tenantId = dtoTenantId;
      if (!tenantId) throw new BadRequestException('tenantId é obrigatório para super admin');
    } else {
      throw new ForbiddenException('Papel sem permissão');
    }

    if (!tenantId) throw new BadRequestException('Não foi possível determinar o tenant');
    return tenantId;
  }

  private async getTenantConfig(tenantId: number): Promise<TenantConfig> {
    let config = await this.tenantConfigRepository.findOne({ where: { tenant_id: tenantId } });
    if (!config) {
      // Configuração padrão se não existir
      config = this.tenantConfigRepository.create({
        tenant_id: tenantId,
        slot_interval: 30,
        timezone: 'America/Sao_Paulo',
      });
    }
    return config;
  }

  private parseTimeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private minutesToTime(minutes: number): string {
    const h = Math.floor(minutes / 60).toString().padStart(2, '0');
    const m = (minutes % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  // ============ MÉTODO PRINCIPAL ============

  async findAvailableSlots(
    professionalId: number,
    serviceId: number,
    date: string, // formato YYYY-MM-DD
    user: any,
  ): Promise<string[]> {
    const tenantId = this.getTenantId(user);

    // 1. Carregar profissional e serviço
    const professional = await this.professionalRepository.findOne({
      where: { id: professionalId, tenant_id: tenantId },
    });
    if (!professional) throw new NotFoundException('Profissional não encontrado no tenant');

    const service = await this.serviceRepository.findOne({
      where: { id: serviceId, tenant_id: tenantId },
    });
    if (!service) throw new NotFoundException('Serviço não encontrado no tenant');

    const duration = service.duration_minutes;
    const config = await this.getTenantConfig(tenantId);
    const slotInterval = config.slot_interval || 30;

    // 2. Determinar dia da semana (0=Domingo, 6=Sábado) considerando timezone do tenant
    const timezone = config.timezone || 'America/Sao_Paulo';
    // Cria data no fuso do tenant, depois obtém dia da semana
    const dateObj = new Date(`${date}T12:00:00`);
    const dayOfWeek = dateObj.getUTCDay(); // Ajuste posterior se necessário

    // 3. Carregar horários de trabalho do profissional para o dia
    const workSchedules = await this.workScheduleRepository.find({
      where: { professional_id: professionalId, tenant_id: tenantId, day_of_week: dayOfWeek },
    });
    if (workSchedules.length === 0) {
      return []; // Profissional não trabalha nesse dia
    }

    // 4. Gerar slots para cada período de trabalho
    const availableSlots: string[] = [];

    for (const schedule of workSchedules) {
      let currentMinutes = this.parseTimeToMinutes(schedule.start_time);
      const endMinutes = this.parseTimeToMinutes(schedule.end_time);
      const breakStart = schedule.break_start ? this.parseTimeToMinutes(schedule.break_start) : null;
      const breakEnd = schedule.break_end ? this.parseTimeToMinutes(schedule.break_end) : null;

      while (currentMinutes + duration <= endMinutes) {
        const slotStart = currentMinutes;
        const slotEnd = slotStart + duration;

        // Verifica se o slot está dentro de uma pausa
        const isDuringBreak =
          breakStart !== null &&
          breakEnd !== null &&
          slotStart < breakEnd &&
          slotEnd > breakStart;

        if (!isDuringBreak) {
          availableSlots.push(this.minutesToTime(slotStart));
        }

        currentMinutes += slotInterval;
      }
    }

    // 5. Remover slots que conflitam com agendamentos existentes
    const startOfDay = new Date(`${date}T00:00:00`);
    const endOfDay = new Date(`${date}T23:59:59`);

    const existingAppointments = await this.appointmentRepository.find({
      where: {
        professional_id: professionalId,
        tenant_id: tenantId,
        status: Not('cancelled'),
        start_time: Between(startOfDay, endOfDay),
      },
    });

    // Converte slots para horários de início e verifica sobreposição
    const freeSlots = availableSlots.filter((slotTime) => {
      const slotStartMinutes = this.parseTimeToMinutes(slotTime);
      const slotEndMinutes = slotStartMinutes + duration;

      // Verifica conflito com cada agendamento existente
      for (const appt of existingAppointments) {
        const apptStartMinutes = appt.start_time.getUTCHours() * 60 + appt.start_time.getUTCMinutes();
        const apptEndMinutes = appt.end_time.getUTCHours() * 60 + appt.end_time.getUTCMinutes();

        if (slotStartMinutes < apptEndMinutes && slotEndMinutes > apptStartMinutes) {
          return false; // conflito
        }
      }
      return true;
    });

    return freeSlots;
  }

  // ============ CRUD ============

  async create(createAppointmentDto: CreateAppointmentDto, user: any): Promise<Appointment> {
    const tenantId = this.getTenantId(user, createAppointmentDto.tenantId);

    const professional = await this.professionalRepository.findOne({
      where: { id: createAppointmentDto.professionalId, tenant_id: tenantId },
    });
    if (!professional) throw new NotFoundException('Profissional não encontrado no tenant');

    const service = await this.serviceRepository.findOne({
      where: { id: createAppointmentDto.serviceId, tenant_id: tenantId },
    });
    if (!service) throw new NotFoundException('Serviço não encontrado no tenant');

    const start = new Date(createAppointmentDto.startTime);
    if (isNaN(start.getTime())) {
      throw new BadRequestException('Data/hora de início inválida');
    }
    const end = new Date(start.getTime() + service.duration_minutes * 60000);

    // Verifica conflito direto
    const conflict = await this.appointmentRepository.findOne({
      where: {
        professional_id: createAppointmentDto.professionalId,
        tenant_id: tenantId,
        status: Not('cancelled'),
        start_time: LessThan(end),
        end_time: MoreThan(start),
      },
    });
    if (conflict) {
      throw new ConflictException('Horário não disponível');
    }

    const appointment = this.appointmentRepository.create({
      tenant_id: tenantId,
      professional_id: createAppointmentDto.professionalId,
      service_id: createAppointmentDto.serviceId,
      customer_name: createAppointmentDto.customerName,
      customer_contact: createAppointmentDto.customerContact,
      start_time: start,
      end_time: end,
      status: createAppointmentDto.status || 'pending',
      notes: createAppointmentDto.notes,
    });

    return this.appointmentRepository.save(appointment);
  }

  async findAll(user: any, filters?: { professionalId?: number; serviceId?: number; date?: string }): Promise<Appointment[]> {
    const where: any = {};
    if (user.role === 'tenant_admin') {
      where.tenant_id = user.tenantId;
    } else if (user.role === 'super_admin') {
      // pode filtrar por tenant via query se quiser
      // por simplicidade, não aplica filtro de tenant
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

    return this.appointmentRepository.find({
      where,
      relations: ['professional', 'service'],
      order: { start_time: 'ASC' },
    });
  }

  async findOne(id: number, user: any): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['professional', 'service'],
    });
    if (!appointment) {
      throw new NotFoundException(`Agendamento com ID ${id} não encontrado`);
    }
    if (user.role === 'tenant_admin' && appointment.tenant_id !== user.tenantId) {
      throw new ForbiddenException('Acesso negado');
    }
    return appointment;
  }

  async update(id: number, updateAppointmentDto: UpdateAppointmentDto, user: any): Promise<Appointment> {
    const appointment = await this.findOne(id, user);

    if (updateAppointmentDto.startTime) {
      // Se alterar horário, valida disponibilidade
      const service = await this.serviceRepository.findOne({
        where: { id: appointment.service_id },
      });
      if (service) {
        const startTime = new Date(updateAppointmentDto.startTime);
        const endTime = new Date(startTime.getTime() + service.duration_minutes * 60000);
        updateAppointmentDto.startTime = undefined; // não atualizar diretamente
        appointment.start_time = startTime;
        appointment.end_time = endTime;
      }
    }

    if (updateAppointmentDto.professionalId) {
      appointment.professional_id = updateAppointmentDto.professionalId;
    }
    if (updateAppointmentDto.serviceId) {
      appointment.service_id = updateAppointmentDto.serviceId;
    }
    if (updateAppointmentDto.customerName) {
      appointment.customer_name = updateAppointmentDto.customerName;
    }
    if (updateAppointmentDto.customerContact) {
      appointment.customer_contact = updateAppointmentDto.customerContact;
    }
    if (updateAppointmentDto.notes !== undefined) {
      appointment.notes = updateAppointmentDto.notes;
    }
    if (updateAppointmentDto.status) {
      appointment.status = updateAppointmentDto.status;
    }

    return this.appointmentRepository.save(appointment);
  }

  async remove(id: number, user: any): Promise<void> {
    const appointment = await this.findOne(id, user);
    const result = await this.appointmentRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Agendamento com ID ${id} não encontrado`);
    }
  }
}