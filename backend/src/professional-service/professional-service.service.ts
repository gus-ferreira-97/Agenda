import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
    ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfessionalService } from '../service/entities/professional-service.entity';
import { Professional } from '../professional/entities/professional.entity';
import { Service } from '../service/entities/service.entity';
import { CreateProfessionalServiceDto } from './dto/create-professional-service.dto';

@Injectable()
export class ProfessionalServiceService {
    constructor(
        @InjectRepository(ProfessionalService)
        private readonly professionalServiceRepo: Repository<ProfessionalService>,
        @InjectRepository(Professional)
        private readonly professionalRepo: Repository<Professional>,
        @InjectRepository(Service)
        private readonly serviceRepo: Repository<Service>,
    ) { }

    async create(dto: CreateProfessionalServiceDto, user: any): Promise<ProfessionalService> {
        let tenantId: number | null | undefined;

        if (user.role === 'tenant_admin') {
            tenantId = user.tenantId;
            if (!tenantId) throw new ForbiddenException('Usuário não associado a tenant');
        } else if (user.role === 'super_admin') {
            tenantId = dto.tenantId;
            if (!tenantId) {
                const professional = await this.professionalRepo.findOne({
                    where: { id: dto.professionalId },
                });
                if (!professional) throw new NotFoundException('Profissional não encontrado');
                tenantId = professional.tenant_id ?? undefined;
            }
        } else {
            throw new ForbiddenException('Papel sem permissão');
        }

        if (!tenantId) {
            throw new BadRequestException('Não foi possível determinar o tenant');
        }

        // Agora tenantId é number
        // Verifica se profissional e serviço pertencem ao tenant
        const professional = await this.professionalRepo.findOne({
            where: { id: dto.professionalId, tenant_id: tenantId },
        });
        if (!professional) {
            throw new NotFoundException('Profissional não encontrado no tenant');
        }

        const service = await this.serviceRepo.findOne({
            where: { id: dto.serviceId, tenant_id: tenantId },
        });
        if (!service) {
            throw new NotFoundException('Serviço não encontrado no tenant');
        }

        // Verifica se associação já existe
        const existing = await this.professionalServiceRepo.findOne({
            where: {
                professional_id: dto.professionalId,
                service_id: dto.serviceId,
                tenant_id: tenantId,
            },
        });
        if (existing) {
            throw new ConflictException('Associação já existe');
        }

        const assoc = this.professionalServiceRepo.create({
            professional_id: dto.professionalId,
            service_id: dto.serviceId,
            tenant_id: tenantId,
        });

        return this.professionalServiceRepo.save(assoc);
    }

    async findAll(user: any, professionalId?: number, serviceId?: number): Promise<ProfessionalService[]> {
        const where: any = {};
        if (user.role === 'tenant_admin') {
            where.tenant_id = user.tenantId;
        }
        if (professionalId) where.professional_id = professionalId;
        if (serviceId) where.service_id = serviceId;

        return this.professionalServiceRepo.find({ where, relations: ['professional', 'service'] });
    }

    async remove(professionalId: number, serviceId: number, user: any): Promise<void> {
        const where: any = {
            professional_id: professionalId,
            service_id: serviceId,
        };

        if (user.role === 'tenant_admin') {
            where.tenant_id = user.tenantId;
        }

        const result = await this.professionalServiceRepo.delete(where);
        if (result.affected === 0) {
            throw new NotFoundException('Associação não encontrada');
        }
    }
}