import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './entities/service.entity';
import { ServiceOption } from './entities/service-option.entity';
import { Appointment } from '../appointment/entities/appointment.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServiceService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(ServiceOption)
    private readonly serviceOptionRepository: Repository<ServiceOption>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
  ) { }

  async create(createServiceDto: CreateServiceDto, user: any): Promise<Service> {
    let tenantId: number | undefined;

    if (user.role === 'tenant_admin') {
      tenantId = user.tenantId;
      if (!tenantId) {
        throw new ForbiddenException('Usuário não está associado a um tenant');
      }
    } else if (user.role === 'super_admin') {
      tenantId = createServiceDto.tenantId;
      if (!tenantId) {
        throw new BadRequestException('tenantId é obrigatório para super admin');
      }
    } else {
      throw new ForbiddenException('Papel sem permissão');
    }

    const service = this.serviceRepository.create({
      name: createServiceDto.name,
      description: createServiceDto.description,
      duration_minutes: createServiceDto.durationMinutes,
      price: createServiceDto.price,
      is_active: createServiceDto.isActive ?? true,
      tenant_id: tenantId ?? null,
    });

    return this.serviceRepository.save(service);
  }

  async findAll(user: any): Promise<Service[]> {
    if (user.role === 'super_admin') {
      return this.serviceRepository.find();
    }
    if (user.role === 'tenant_admin') {
      return this.serviceRepository.find({
        where: { tenant_id: user.tenantId },
      });
    }
    throw new ForbiddenException('Papel sem permissão');
  }

  async findOne(id: number, user: any): Promise<Service> {
    const service = await this.serviceRepository.findOne({ where: { id } });

    if (!service) {
      throw new NotFoundException(`Serviço com ID ${id} não encontrado`);
    }

    if (user.role === 'tenant_admin' && service.tenant_id !== user.tenantId) {
      throw new ForbiddenException('Acesso negado');
    }

    return service;
  }

  async update(
    id: number,
    updateServiceDto: UpdateServiceDto,
    user: any,
  ): Promise<Service> {
    const service = await this.findOne(id, user);

    if (updateServiceDto.name !== undefined) {
      service.name = updateServiceDto.name;
    }
    if (updateServiceDto.description !== undefined) {
      service.description = updateServiceDto.description || null;
    }
    if (updateServiceDto.durationMinutes !== undefined) {
      service.duration_minutes = updateServiceDto.durationMinutes;
    }
    if (updateServiceDto.price !== undefined) {
      service.price = updateServiceDto.price;
    }
    if (updateServiceDto.isActive !== undefined) {
      service.is_active = updateServiceDto.isActive;
    }

    return this.serviceRepository.save(service);
  }

  async remove(id: number, user: any): Promise<{ message: string }> {
    const service = await this.findOne(id, user);

    // Conta agendamentos que usam este serviço diretamente OU uma de suas variações
    const appointmentCount = await this.appointmentRepository
      .createQueryBuilder('a')
      .leftJoin(ServiceOption, 'so', 'so.id = a.service_option_id')
      .where('a.service_id = :id OR so.service_id = :id', { id })
      .getCount();

    if (appointmentCount > 0) {
      service.is_active = false;
      await this.serviceRepository.save(service);
      return {
        message: `Este serviço possui ${appointmentCount} agendamento(s) e foi desativado em vez de excluído.`,
      };
    }

    // Remove as variações antes do serviço, evitando bloqueio por FK
    await this.serviceOptionRepository.delete({ service_id: id });

    await this.serviceRepository.delete(id);
    return { message: 'Serviço excluído com sucesso.' };
  }
}