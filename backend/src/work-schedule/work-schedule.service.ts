import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
    ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkSchedule } from '../professional/entities/work-schedule.entity';
import { Professional } from '../professional/entities/professional.entity';
import { CreateWorkScheduleDto } from './dto/create-work-schedule.dto';
import { UpdateWorkScheduleDto } from './dto/update-work-schedule.dto';

@Injectable()
export class WorkScheduleService {
    constructor(
        @InjectRepository(WorkSchedule)
        private readonly workScheduleRepository: Repository<WorkSchedule>,
        @InjectRepository(Professional)
        private readonly professionalRepository: Repository<Professional>,
    ) { }

    async create(dto: CreateWorkScheduleDto, user: any): Promise<WorkSchedule> {
        let tenantId: number | null | undefined;

        if (user.role === 'tenant_admin') {
            tenantId = user.tenantId;
            if (!tenantId) throw new ForbiddenException('Usuário não associado a um tenant');
        } else if (user.role === 'super_admin') {
            tenantId = dto.tenantId;
            if (!tenantId) {
                // Tenta obter a partir do profissional
                const professional = await this.professionalRepository.findOne({
                    where: { id: dto.professionalId },
                });
                if (!professional) throw new NotFoundException('Profissional não encontrado');
                tenantId = professional.tenant_id ?? undefined;
            }
        } else {
            throw new ForbiddenException('Papel sem permissão');
        }

        if (!tenantId) throw new BadRequestException('Não foi possível determinar o tenant');

        // Verifica se o profissional pertence ao tenant
        const professional = await this.professionalRepository.findOne({
            where: { id: dto.professionalId, tenant_id: tenantId },
        });
        if (!professional) {
            throw new NotFoundException('Profissional não encontrado no tenant');
        }

        // Verifica conflito de horários (mesmo profissional, mesmo dia)
        const existing = await this.workScheduleRepository.findOne({
            where: {
                professional_id: dto.professionalId,
                tenant_id: tenantId,
                day_of_week: dto.dayOfWeek,
            },
        });
        if (existing) {
            throw new ConflictException('Já existe um horário cadastrado para esse dia');
        }

        const schedule = this.workScheduleRepository.create({
            professional_id: dto.professionalId,
            tenant_id: tenantId,
            day_of_week: dto.dayOfWeek,
            start_time: dto.startTime,
            end_time: dto.endTime,
            break_start: dto.breakStart || null,
            break_end: dto.breakEnd || null,
        } as any);

        return this.workScheduleRepository.save(schedule as any);
    }

    async findAll(user: any, professionalId?: number): Promise<WorkSchedule[]> {
        const where: any = {};
        if (user.role === 'tenant_admin') {
            where.tenant_id = user.tenantId;
        }
        if (professionalId) where.professional_id = professionalId;

        return this.workScheduleRepository.find({
            where,
            relations: ['professional'],
            order: { day_of_week: 'ASC', start_time: 'ASC' },
        });
    }

    async findOne(id: number, user: any): Promise<WorkSchedule> {
        const schedule = await this.workScheduleRepository.findOne({
            where: { id },
            relations: ['professional'],
        });
        if (!schedule) {
            throw new NotFoundException(`Horário com ID ${id} não encontrado`);
        }
        if (user.role === 'tenant_admin' && schedule.tenant_id !== user.tenantId) {
            throw new ForbiddenException('Acesso negado');
        }
        return schedule;
    }

    async update(id: number, dto: UpdateWorkScheduleDto, user: any): Promise<WorkSchedule> {
        const schedule = await this.findOne(id, user);
        Object.assign(schedule, {
            day_of_week: dto.dayOfWeek ?? schedule.day_of_week,
            start_time: dto.startTime ?? schedule.start_time,
            end_time: dto.endTime ?? schedule.end_time,
            break_start: dto.breakStart ?? schedule.break_start,
            break_end: dto.breakEnd ?? schedule.break_end,
        });
        return this.workScheduleRepository.save(schedule);
    }

    async remove(id: number, user: any): Promise<void> {
        const schedule = await this.findOne(id, user);
        const result = await this.workScheduleRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Horário com ID ${id} não encontrado`);
        }
    }
}