import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Professional } from './entities/professional.entity';
import { Appointment } from '../appointment/entities/appointment.entity';
import { CreateProfessionalDto } from './dto/create-professional.dto';
import { UpdateProfessionalDto } from './dto/update-professional.dto';

@Injectable()
export class ProfessionalService {
  constructor(
    @InjectRepository(Professional)
    private readonly professionalRepository: Repository<Professional>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
  ) { }

  async create(createProfessionalDto: CreateProfessionalDto, user: any): Promise<Professional> {
    let tenantId: number | null = null;

    if (user.role === 'super_admin') {
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
    } as any);

    return this.professionalRepository.save(professional as any);
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

    if (updateProfessionalDto.name !== undefined) {
      professional.name = updateProfessionalDto.name;
    }
    if (updateProfessionalDto.specialty !== undefined) {
      professional.specialty = updateProfessionalDto.specialty;
    }
    if (updateProfessionalDto.isActive !== undefined) {
      professional.is_active = updateProfessionalDto.isActive;
    }

    return this.professionalRepository.save(professional);
  }

  async remove(id: number, user: any): Promise<{ message: string }> {
    const professional = await this.findOne(id, user);

    const appointmentCount = await this.appointmentRepository.count({
      where: { professional_id: id },
    });

    if (appointmentCount > 0) {
      professional.is_active = false;
      await this.professionalRepository.save(professional);
      return {
        message: `Este profissional possui ${appointmentCount} agendamento(s) e foi desativado em vez de excluído.`,
      };
    }

    await this.professionalRepository.delete(id);
    return { message: 'Profissional excluído com sucesso.' };
  }
}