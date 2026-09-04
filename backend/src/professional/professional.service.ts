import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Professional } from './entities/professional.entity';
import { CreateProfessionalDto } from './dto/create-professional.dto';
import { UpdateProfessionalDto } from './dto/update-professional.dto';

@Injectable()
export class ProfessionalService {
  constructor(
    @InjectRepository(Professional)
    private readonly professionalRepository: Repository<Professional>,
  ) {}

  async create(createProfessionalDto: CreateProfessionalDto, user: any): Promise<Professional> {
    let tenantId: number | null = null;

    if (user.role === 'super_admin') {
      // Super admin pode definir tenant, senão pode criar sem tenant (mas não recomendado)
      tenantId = createProfessionalDto.tenantId || null;
    } else if (user.role === 'tenant_admin') {
      tenantId = user.tenantId;
      if (!tenantId) {
        throw new ForbiddenException('Usuário não está associado a um tenant');
      }
    } else {
      throw new ForbiddenException('Papel sem permissão');
    }

    const professional = this.professionalRepository.create({
      name: createProfessionalDto.name,
      specialty: createProfessionalDto.specialty,
      is_active: createProfessionalDto.isActive ?? true,
      tenant_id: tenantId,
    });

    return this.professionalRepository.save(professional);
  }

  async findAll(user: any): Promise<Professional[]> {
    if (user.role === 'super_admin') {
      return this.professionalRepository.find();
    }
    if (user.role === 'tenant_admin') {
      return this.professionalRepository.find({
        where: { tenant_id: user.tenantId },
      });
    }
    throw new ForbiddenException('Papel sem permissão');
  }

  async findOne(id: number, user: any): Promise<Professional> {
    const professional = await this.professionalRepository.findOne({
      where: { id },
    });

    if (!professional) {
      throw new NotFoundException(`Profissional com ID ${id} não encontrado`);
    }

    // Verifica se o usuário tem permissão para ver (tenant_admin só vê do próprio tenant)
    if (user.role === 'tenant_admin' && professional.tenant_id !== user.tenantId) {
      throw new ForbiddenException('Acesso negado');
    }

    return professional;
  }

  async update(
    id: number,
    updateProfessionalDto: UpdateProfessionalDto,
    user: any,
  ): Promise<Professional> {
    const professional = await this.findOne(id, user);
    Object.assign(professional, updateProfessionalDto);
    return this.professionalRepository.save(professional);
  }

  async remove(id: number, user: any): Promise<void> {
    const professional = await this.findOne(id, user);
    const result = await this.professionalRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Profissional com ID ${id} não encontrado`);
    }
  }
}