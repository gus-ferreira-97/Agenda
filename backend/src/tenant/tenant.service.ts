import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Professional } from '../professional/entities/professional.entity';
import { Service } from '../service/entities/service.entity';
import { Appointment } from '../appointment/entities/appointment.entity';
import { WorkSchedule } from '../professional/entities/work-schedule.entity';
import { ProfessionalService } from '../service/entities/professional-service.entity';
import { User } from '../user/entities/user.entity';
import { getPlan } from '../common/plans';
import {
  sanitizeSubdomain,
  validateSubdomainOrThrow,
} from '../common/helpers/subdomain';
import { Tenant } from './entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    @InjectRepository(Professional)
    private readonly professionalRepository: Repository<Professional>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(WorkSchedule)
    private readonly workScheduleRepository: Repository<WorkSchedule>,
    @InjectRepository(ProfessionalService)
    private readonly professionalServiceRepository: Repository<ProfessionalService>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // ============================================================================
  // CRUD
  // ============================================================================

  async create(dto: CreateTenantDto): Promise<Tenant> {
    const subdomain = sanitizeSubdomain(dto.subdomain);
    validateSubdomainOrThrow(subdomain);

    const existing = await this.tenantRepository.findOne({
      where: { subdomain },
    });
    if (existing) {
      throw new ConflictException('Subdomínio já está em uso');
    }

    const tenant = this.tenantRepository.create({
      name: dto.name,
      subdomain,
      status: dto.status || 'ativo',
      plan: dto.plan || 'basico',
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

  async update(id: number, dto: UpdateTenantDto): Promise<Tenant> {
    const tenant = await this.findOne(id);

    // Normaliza e valida subdomínio, se presente
    if (dto.subdomain !== undefined) {
      const subdomain = sanitizeSubdomain(dto.subdomain);
      validateSubdomainOrThrow(subdomain);

      if (subdomain !== tenant.subdomain) {
        const existing = await this.tenantRepository.findOne({
          where: { subdomain },
        });
        if (existing) {
          throw new ConflictException('Subdomínio já está em uso');
        }
      }

      tenant.subdomain = subdomain;
    }

    if (dto.name !== undefined) tenant.name = dto.name;

    // Detecta transição para "ativo" e inicia trial se ainda não foi usado
    if (
      dto.status === 'ativo' &&
      tenant.status !== 'ativo' &&
      !tenant.trial_used
    ) {
      const now = new Date();
      const trialEnd = new Date(now);
      trialEnd.setDate(trialEnd.getDate() + 7);

      tenant.trial_started_at = now;
      tenant.trial_ends_at = trialEnd;
      tenant.trial_used = true;
    }

    if (dto.status !== undefined) tenant.status = dto.status;
    if (dto.plan !== undefined) tenant.plan = dto.plan;

    return this.tenantRepository.save(tenant);
  }

  async remove(id: number): Promise<{ message: string }> {
    // Tudo dentro de uma transação: contar + soft-deletar atomicamente.
    // Evita race condition onde um user é criado entre a contagem e o delete.
    await this.tenantRepository.manager.transaction(async (manager) => {
      const tenant = await manager.findOne(Tenant, { where: { id } });
      if (!tenant) {
        throw new NotFoundException(`Tenant com ID ${id} não encontrado`);
      }

      // Conta dependências funcionais (exclui audit_logs, que são histórico)
      const [
        usersCount,
        professionalsCount,
        servicesCount,
        appointmentsCount,
        workSchedulesCount,
        professionalServicesCount,
      ] = await Promise.all([
        manager.count(User, { where: { tenant_id: id } }),
        manager.count(Professional, { where: { tenant_id: id } }),
        manager.count(Service, { where: { tenant_id: id } }),
        manager.count(Appointment, { where: { tenant_id: id } }),
        manager.count(WorkSchedule, { where: { tenant_id: id } }),
        manager.count(ProfessionalService, { where: { tenant_id: id } }),
      ]);

      const totalDependencies =
        usersCount +
        professionalsCount +
        servicesCount +
        appointmentsCount +
        workSchedulesCount +
        professionalServicesCount;

      if (totalDependencies > 0) {
        throw new ConflictException(
          'Não é possível excluir este tenant porque ele possui dados vinculados (usuários, profissionais, serviços ou agendamentos). Desative-o em vez de excluir.',
        );
      }

      // Soft delete: mantém o registro para auditoria (LGPD art. 16).
      // Registros com deleted_at são ignorados por padrão nas queries.
      await manager.softDelete(Tenant, id);
    });

    return { message: 'Tenant excluído com sucesso.' };
  }

  // ============================================================================
  // BRANDING
  // ============================================================================

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

    const plan = getPlan(tenant.plan);

    if (!plan.allowBranding) {
      throw new ForbiddenException(
        `Seu plano ${plan.name} não permite personalização. Faça upgrade para o plano Profissional ou superior.`,
      );
    }

    if (dto.primaryColor !== undefined) tenant.primary_color = dto.primaryColor;
    if (dto.logoUrl !== undefined) tenant.logo_url = dto.logoUrl || null;
    if (dto.welcomeMessage !== undefined)
      tenant.welcome_message = dto.welcomeMessage || null;
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

  // ============================================================================
  // PLANO / TRIAL
  // ============================================================================

  async getPlanInfo(tenantId: number) {
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant não encontrado');
    }

    const plan = getPlan(tenant.plan);
    const currentProfessionals = await this.professionalRepository.count({
      where: { tenant_id: tenantId },
    });

    return {
      plan: plan.key,
      planName: plan.name,
      maxProfessionals: plan.maxProfessionals,
      currentProfessionals,
      allowBranding: plan.allowBranding,
      allowAdvancedReports: plan.allowAdvancedReports,
      allowPrioritySupport: plan.allowPrioritySupport,
    };
  }

  async expireTrials(): Promise<number> {
    const now = new Date();

    const result = await this.tenantRepository
      .createQueryBuilder()
      .update()
      .set({ status: 'trial_expirado' })
      .where('status = :status', { status: 'ativo' })
      .andWhere('trial_ends_at IS NOT NULL')
      .andWhere('trial_ends_at < :now', { now })
      .execute();

    return result.affected || 0;
  }

  async findExpiredTrials(): Promise<Tenant[]> {
    const now = new Date();
    return this.tenantRepository
      .createQueryBuilder('t')
      .where('t.status = :status', { status: 'ativo' })
      .andWhere('t.trial_ends_at IS NOT NULL')
      .andWhere('t.trial_ends_at < :now', { now })
      .getMany();
  }

  async getTrialInfo(tenantId: number) {
    const tenant = await this.findOne(tenantId);

    const now = new Date();
    const trialEndsAt = tenant.trial_ends_at;

    const isTrial =
      tenant.status === 'ativo' &&
      tenant.trial_used === true &&
      !!trialEndsAt &&
      trialEndsAt > now;

    const isExpired = tenant.status === 'trial_expirado';

    let daysLeft = 0;
    if (isTrial && trialEndsAt) {
      const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );
      const startOfEnd = new Date(
        trialEndsAt.getFullYear(),
        trialEndsAt.getMonth(),
        trialEndsAt.getDate(),
      );
      const diffDays = Math.round(
        (startOfEnd.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24),
      );
      daysLeft = Math.max(0, diffDays);
    }

    return {
      isTrial,
      isExpired,
      daysLeft,
      trialStartedAt: tenant.trial_started_at,
      trialEndsAt: tenant.trial_ends_at,
      status: tenant.status,
      plan: tenant.plan,
    };
  }
}