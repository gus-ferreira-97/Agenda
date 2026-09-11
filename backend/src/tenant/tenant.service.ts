import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) { }

  async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
    // Verifica se já existe um tenant com o mesmo subdomínio
    const existing = await this.tenantRepository.findOne({
      where: { subdomain: createTenantDto.subdomain },
    });
    if (existing) {
      throw new ConflictException('Subdomínio já está em uso');
    }

    const tenant = this.tenantRepository.create({
      ...createTenantDto,
      status: createTenantDto.status || 'ativo',
    });
    return this.tenantRepository.save(tenant);
  }

  async findAll(): Promise<Tenant[]> {
    return this.tenantRepository.find();
  }

  async findOne(id: number): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({ where: { id } });
    if (!tenant) {
      throw new NotFoundException(`Tenant com ID ${id} não encontrado`);
    }
    return tenant;
  }

  async update(id: number, updateTenantDto: UpdateTenantDto): Promise<Tenant> {
    const tenant = await this.findOne(id);
    Object.assign(tenant, updateTenantDto);
    return this.tenantRepository.save(tenant);
  }

  async remove(id: number): Promise<void> {
    const result = await this.tenantRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Tenant com ID ${id} não encontrado`);
    }
  }

  async getPublicInfo(subdomain: string) {
    const tenant = await this.tenantRepository.findOne({
      where: { subdomain: subdomain.toLowerCase(), status: 'ativo' },
    });

    if (!tenant) {
      throw new NotFoundException('Estabelecimento não encontrado');
    }

    return {
      id: tenant.id,
      name: tenant.name,
      subdomain: tenant.subdomain,
      primaryColor: tenant.primary_color,
      logoUrl: tenant.logo_url,
      welcomeMessage: tenant.welcome_message,
      phone: tenant.phone,
      address: tenant.address,
    };
  }

  async updateBranding(
    id: number,
    dto: {
      primaryColor?: string;
      logoUrl?: string;
      welcomeMessage?: string;
      phone?: string;
      address?: string;
    },
  ) {
    const tenant = await this.findOne(id);

    if (dto.primaryColor !== undefined) tenant.primary_color = dto.primaryColor;
    if (dto.logoUrl !== undefined) tenant.logo_url = dto.logoUrl || null;
    if (dto.welcomeMessage !== undefined) tenant.welcome_message = dto.welcomeMessage || null;
    if (dto.phone !== undefined) tenant.phone = dto.phone || null;
    if (dto.address !== undefined) tenant.address = dto.address || null;

    const updated = await this.tenantRepository.save(tenant);

    return {
      id: updated.id,
      name: updated.name,
      primaryColor: updated.primary_color,
      logoUrl: updated.logo_url,
      welcomeMessage: updated.welcome_message,
      phone: updated.phone,
      address: updated.address,
    };
  }
}