import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './entities/service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServiceService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

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
    Object.assign(service, updateServiceDto);
    return this.serviceRepository.save(service);
  }

  async remove(id: number, user: any): Promise<void> {
    const service = await this.findOne(id, user);
    const result = await this.serviceRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Serviço com ID ${id} não encontrado`);
    }
  }
}