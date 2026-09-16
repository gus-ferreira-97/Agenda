import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceOption } from '../service/entities/service-option.entity';
import { Service } from '../service/entities/service.entity';
import { Appointment } from '../appointment/entities/appointment.entity';
import { CreateServiceOptionDto } from './dto/create-service-option.dto';
import { UpdateServiceOptionDto } from './dto/update-service-option.dto';

@Injectable()
export class ServiceOptionService {
  constructor(
    @InjectRepository(ServiceOption)
    private readonly serviceOptionRepository: Repository<ServiceOption>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
  ) {}

  async create(dto: CreateServiceOptionDto, user: any): Promise<ServiceOption> {
    const tenantId = this.getTenantId(user);

    // Valida que o serviço pai pertence ao tenant
    const service = await this.serviceRepository.findOne({
      where: { id: dto.serviceId, tenant_id: tenantId },
    });
    if (!service) {
      throw new NotFoundException('Serviço não encontrado no seu estabelecimento');
    }

    const option = this.serviceOptionRepository.create({
      tenant_id: tenantId,
      service_id: dto.serviceId,
      name: dto.name,
      description: dto.description ?? null,
      image_url: dto.imageUrl ?? null,
      price: dto.price ?? null,
      duration_minutes: dto.durationMinutes ?? null,
      is_active: dto.isActive ?? true,
      sort_order: dto.sortOrder ?? 0,
    });

    return this.serviceOptionRepository.save(option);
  }

  async findAll(user: any, serviceId?: number): Promise<ServiceOption[]> {
    const where: any = {};

    if (user.role === 'tenant_admin') {
      where.tenant_id = user.tenantId;
    } else if (user.role === 'super_admin') {
      // Super admin pode filtrar via query, ou ver todos
    } else {
      throw new ForbiddenException('Papel sem permissão');
    }

    if (serviceId) {
      where.service_id = serviceId;
    }

    return this.serviceOptionRepository.find({
      where,
      order: { sort_order: 'ASC', created_at: 'ASC' },
    });
  }

  async findOne(id: number, user: any): Promise<ServiceOption> {
    const option = await this.serviceOptionRepository.findOne({
      where: { id },
    });

    if (!option) {
      throw new NotFoundException(`Variação com ID ${id} não encontrada`);
    }

    if (user.role === 'tenant_admin' && option.tenant_id !== user.tenantId) {
      throw new ForbiddenException('Acesso negado');
    }

    return option;
  }

  async update(
    id: number,
    dto: UpdateServiceOptionDto,
    user: any,
  ): Promise<ServiceOption> {
    const option = await this.findOne(id, user);

    if (dto.name !== undefined) option.name = dto.name;
    if (dto.description !== undefined) option.description = dto.description || null;
    if (dto.imageUrl !== undefined) option.image_url = dto.imageUrl || null;
    if (dto.price !== undefined) option.price = dto.price;
    if (dto.durationMinutes !== undefined) option.duration_minutes = dto.durationMinutes;
    if (dto.isActive !== undefined) option.is_active = dto.isActive;
    if (dto.sortOrder !== undefined) option.sort_order = dto.sortOrder;

    return this.serviceOptionRepository.save(option);
  }

  async remove(id: number, user: any): Promise<{ message: string }> {
    const option = await this.findOne(id, user);

    // Conta agendamentos que usam esta variação
    const appointmentCount = await this.appointmentRepository.count({
      where: { service_option_id: id },
    });

    if (appointmentCount > 0) {
      option.is_active = false;
      await this.serviceOptionRepository.save(option);
      return {
        message: `Esta variação possui ${appointmentCount} agendamento(s) e foi desativada em vez de excluída.`,
      };
    }

    await this.serviceOptionRepository.delete(id);
    return { message: 'Variação excluída com sucesso.' };
  }

  private getTenantId(user: any): number {
    if (user.role === 'tenant_admin') {
      if (!user.tenantId) {
        throw new ForbiddenException('Usuário não associado a um tenant');
      }
      return user.tenantId;
    }
    // Super admin não deveria criar variações sem contexto de tenant
    throw new ForbiddenException(
      'Apenas administradores de estabelecimento podem gerenciar variações',
    );
  }
}