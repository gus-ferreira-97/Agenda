import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  Not,
  Between,
  LessThan,
  MoreThan,
  QueryFailedError,
} from 'typeorm';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import { Professional } from '../professional/entities/professional.entity';
import { Service } from '../service/entities/service.entity';
import { WorkSchedule } from '../professional/entities/work-schedule.entity';
import { TenantConfig } from '../tenant/entities/tenant-config.entity';
import { Appointment } from '../appointment/entities/appointment.entity';
import { Tenant } from '../tenant/entities/tenant.entity';
import { User } from '../user/entities/user.entity';
import { CreateAppointmentPublicDto } from './dto/create-appointment-public.dto';
import { RegisterTenantDto } from './dto/register-tenant.dto';
import { ProfessionalService } from '../service/entities/professional-service.entity';
import { MailService } from '../mail/mail.service';
import { ServiceOption } from '../service/entities/service-option.entity';
import { getPublicPlans } from '../common/plans';
import { TurnstileService } from '../common/turnstile/turnstile.service';
import {
  sanitizeSubdomain,
  validateSubdomainOrThrow,
} from '../common/helpers/subdomain';

/** Erro de violação de constraint UNIQUE do Postgres */
const PG_UNIQUE_VIOLATION = '23505';

@Injectable()
export class PublicService {
  constructor(
    @InjectRepository(Professional)
    private readonly professionalRepo: Repository<Professional>,
    @InjectRepository(Service)
    private readonly serviceRepo: Repository<Service>,
    @InjectRepository(ServiceOption)
    private readonly serviceOptionRepo: Repository<ServiceOption>,
    @InjectRepository(WorkSchedule)
    private readonly workScheduleRepo: Repository<WorkSchedule>,
    @InjectRepository(TenantConfig)
    private readonly tenantConfigRepo: Repository<TenantConfig>,
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(ProfessionalService)
    private readonly professionalServiceRepo: Repository<ProfessionalService>,
    private readonly mailService: MailService,
    private readonly turnstileService: TurnstileService,
  ) { }

  // ============================================================================
  // REGISTRO DE TENANT
  // ============================================================================

  async registerTenant(dto: RegisterTenantDto): Promise<{ message: string }> {
    await this.turnstileService.validateToken(dto.captchaToken);

    if (dto._hp && dto._hp.trim() !== '') {
      throw new BadRequestException('Requisição inválida.');
    }

    const subdomain = sanitizeSubdomain(dto.subdomain);
    validateSubdomainOrThrow(subdomain);

    // Checagens antecipadas — melhor UX (409 em vez de 500 do banco)
    const [existingTenant, existingUser] = await Promise.all([
      this.tenantRepo.findOne({ where: { subdomain } }),
      this.userRepo.findOne({ where: { email: dto.email } }),
    ]);

    if (existingTenant) {
      throw new ConflictException('Este subdomínio já está em uso');
    }
    if (existingUser) {
      throw new ConflictException('Este e-mail já está cadastrado');
    }

    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Transação: tenant + user criados atomicamente
    let savedUser: User;
    try {
      savedUser = await this.tenantRepo.manager.transaction(async (manager) => {
        const tenant = manager.create(Tenant, {
          name: dto.tenantName,
          subdomain,
          status: 'aguardando_verificacao',
          plan: dto.plan || 'basico',
        });
        const savedTenant = await manager.save(tenant);

        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const user = manager.create(User, {
          name: dto.ownerName,
          email: dto.email,
          password_hash: hashedPassword,
          role: 'tenant_admin',
          tenant_id: savedTenant.id,
          email_verified: false,
          email_verification_token: token,
          email_verification_expires: expires,
        });

        return manager.save(user);
      });
    } catch (error) {
      // Race condition: outro request criou o mesmo subdomínio/e-mail entre
      // nossa checagem e o INSERT. O banco rejeitou via UNIQUE constraint.
      if (
        error instanceof QueryFailedError &&
        (error as any).driverError?.code === PG_UNIQUE_VIOLATION
      ) {
        throw new ConflictException(
          'Subdomínio ou e-mail já cadastrado. Tente novamente.',
        );
      }
      throw error;
    }

    // E-mail fora da transação (chamada externa — não deve rollback em caso de falha)
    await this.mailService.sendEmailVerificationEmail(savedUser.email, token);

    return {
      message:
        'Conta criada com sucesso! Enviamos um e-mail de confirmação. Verifique sua caixa de entrada para ativar sua conta.',
    };
  }

  // ============================================================================
  // CATÁLOGO PÚBLICO
  // ============================================================================

  async getProfessionals(tenantId: number): Promise<Professional[]> {
    return this.professionalRepo.find({
      where: { tenant_id: tenantId, is_active: true },
      select: ['id', 'name', 'specialty'],
    });
  }

  async getServices(tenantId: number): Promise<Service[]> {
    return this.serviceRepo.find({
      where: { tenant_id: tenantId, is_active: true },
      select: ['id', 'name', 'duration_minutes', 'price'],
    });
  }

  async getProfessionalServices(tenantId: number) {
    return this.professionalServiceRepo.find({
      where: { tenant_id: tenantId },
      select: ['professional_id', 'service_id'],
    });
  }

  async getServiceOptions(tenantId: number, serviceId: number) {
    await this.validateService(tenantId, serviceId);

    const options = await this.serviceOptionRepo.find({
      where: {
        service_id: serviceId,
        tenant_id: tenantId,
        is_active: true,
      },
      order: { sort_order: 'ASC', created_at: 'ASC' },
    });

    // Retorna apenas os campos necessários para o cliente final
    return options.map((option) => ({
      id: option.id,
      name: option.name,
      description: option.description,
      imageUrl: option.image_url,
      price: option.price,
      durationMinutes: option.duration_minutes,
    }));
  }

  async getTenantInfo(subdomain: string) {
    const tenant = await this.tenantRepo.findOne({
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

  getPublicPlans() {
    return getPublicPlans();
  }

  // ============================================================================
  // DISPONIBILIDADE DE HORÁRIOS
  // ============================================================================

  async getAvailableSlots(
    tenantId: number,
    professionalId: number,
    serviceId: number,
    date: string,
    serviceOptionId?: number,
  ): Promise<string[]> {
    // 1. Valida entidades
    const professional = await this.validateProfessional(tenantId, professionalId);
    const { serviceOption, durationMinutes } = await this.validateServiceAndOption(
      tenantId,
      serviceId,
      serviceOptionId,
    );

    // 2. Resolve config do tenant (interval, timezone)
    const config = await this.tenantConfigRepo.findOne({ where: { tenant_id: tenantId } });
    const slotInterval = config?.slot_interval || 30;

    // 3. Descobre o dia da semana
    //    NOTA: usa timezone local do container (TZ=America/Sao_Paulo no Compose).
    //    Para timezone dinâmico por tenant, migrar para dayjs/luxon no v2.
    const dayOfWeek = new Date(`${date}T12:00:00`).getDay();

    // 4. Busca schedules ativos do dia
    const schedules = await this.workScheduleRepo.find({
      where: {
        professional_id: professionalId,
        tenant_id: tenantId,
        day_of_week: dayOfWeek,
      },
    });
    if (schedules.length === 0) return [];

    // 5. Gera slots candidatos
    const candidateSlots = this.generateCandidateSlots(
      schedules,
      durationMinutes,
      slotInterval,
    );

    // 6. Remove slots ocupados
    return this.filterOccupiedSlots(
      candidateSlots,
      professionalId,
      tenantId,
      date,
      durationMinutes,
    );
  }

  // ============================================================================
  // CRIAÇÃO DE AGENDAMENTO
  // ============================================================================

  async createAppointment(
    tenantId: number,
    dto: CreateAppointmentPublicDto,
  ): Promise<Appointment> {
    await this.turnstileService.validateToken(dto.captchaToken);

    if (dto._hp && dto._hp.trim() !== '') {
      throw new BadRequestException('Requisição inválida.');
    }

    const {
      professionalId,
      serviceId,
      serviceOptionId,
      customerName,
      customerContact,
      startTime,
      notes,
    } = dto;

    const start = new Date(startTime);
    if (isNaN(start.getTime())) {
      throw new BadRequestException('Data/hora inválida');
    }

    // Valida profissional (pertence ao tenant)
    await this.validateProfessional(tenantId, professionalId);

    // Valida serviço + opção (retorna duração)
    const { durationMinutes } = await this.validateServiceAndOption(
      tenantId,
      serviceId,
      serviceOptionId,
    );

    const end = new Date(start.getTime() + durationMinutes * 60000);

    // Verifica conflito — com tenant_id para isolamento multi-tenant
    const conflict = await this.appointmentRepo.findOne({
      where: {
        tenant_id: tenantId,
        professional_id: professionalId,
        status: Not('cancelled'),
        start_time: LessThan(end),
        end_time: MoreThan(start),
      },
    });

    if (conflict) {
      throw new ConflictException('Horário não disponível');
    }

    const appointment = this.appointmentRepo.create({
      tenant_id: tenantId,
      professional_id: professionalId,
      service_id: serviceId,
      service_option_id: serviceOptionId ?? null,
      customer_name: customerName,
      customer_contact: customerContact,
      start_time: start,
      end_time: end,
      status: 'pending',
      notes,
    });

    try {
      return await this.appointmentRepo.save(appointment);
    } catch (error) {
      // Race condition: outro request criou o mesmo slot entre nossa checagem
      // e o INSERT. A constraint UNIQUE parcial do banco captura.
      if (
        error instanceof QueryFailedError &&
        (error as any).driverError?.code === PG_UNIQUE_VIOLATION
      ) {
        throw new ConflictException('Horário não disponível');
      }
      throw error;
    }
  }

  // ============================================================================
  // VERIFICAÇÃO DE E-MAIL
  // ============================================================================

  async verifyEmail(token: string): Promise<{ message: string }> {
    if (!token) {
      throw new BadRequestException('Token não informado');
    }

    const user = await this.userRepo.findOne({
      where: { email_verification_token: token },
    });

    if (!user) {
      throw new BadRequestException('Token inválido ou já utilizado');
    }

    if (
      !user.email_verification_expires ||
      user.email_verification_expires < new Date()
    ) {
      throw new BadRequestException('Token expirado. Solicite um novo link.');
    }

    if (user.email_verified) {
      return { message: 'E-mail já verificado. Você pode fazer login.' };
    }

    // Transação: user verificado + tenant movido para 'pendente' atomicamente
    await this.userRepo.manager.transaction(async (manager) => {
      user.email_verified = true;
      user.email_verification_token = null;
      user.email_verification_expires = null;
      await manager.save(user);

      if (user.tenant_id) {
        const tenant = await manager.findOne(Tenant, {
          where: { id: user.tenant_id },
        });
        if (tenant && tenant.status === 'aguardando_verificacao') {
          tenant.status = 'pendente';
          await manager.save(tenant);
        }
      }
    });

    return {
      message:
        'E-mail verificado com sucesso! Sua conta está em análise e você receberá uma notificação quando for ativada.',
    };
  }

  /**
   * Valida que o profissional existe, pertence ao tenant e está ativo.
   * Previne que um atacante crie agendamentos com professionalId de outro tenant.
   */
  private async validateProfessional(
    tenantId: number,
    professionalId: number,
  ): Promise<Professional> {
    const professional = await this.professionalRepo.findOne({
      where: { id: professionalId, tenant_id: tenantId, is_active: true },
    });
    if (!professional) {
      throw new NotFoundException('Profissional não encontrado');
    }
    return professional;
  }

  /**
   * Valida que o serviço existe, pertence ao tenant e está ativo.
   * Se uma variação foi informada, valida também.
   * Retorna a duração efetiva (da variação ou do serviço).
   */
  private async validateServiceAndOption(
    tenantId: number,
    serviceId: number,
    serviceOptionId?: number,
  ): Promise<{ service: Service; serviceOption: ServiceOption | null; durationMinutes: number }> {
    const service = await this.validateService(tenantId, serviceId);

    let serviceOption: ServiceOption | null = null;
    if (serviceOptionId) {
      serviceOption = await this.serviceOptionRepo.findOne({
        where: {
          id: serviceOptionId,
          service_id: serviceId,
          tenant_id: tenantId,
          is_active: true,
        },
      });
      if (!serviceOption) {
        throw new BadRequestException('Variação de serviço inválida');
      }
    }

    const durationMinutes =
      serviceOption?.duration_minutes ?? service.duration_minutes;

    return { service, serviceOption, durationMinutes };
  }

  private async validateService(
    tenantId: number,
    serviceId: number,
  ): Promise<Service> {
    const service = await this.serviceRepo.findOne({
      where: { id: serviceId, tenant_id: tenantId, is_active: true },
    });
    if (!service) {
      throw new NotFoundException('Serviço não encontrado');
    }
    return service;
  }

  /**
   * Gera a lista de horários candidatos a partir dos schedules do dia.
   * Remove os que caem em intervalos de break.
   */
  private generateCandidateSlots(
    schedules: WorkSchedule[],
    durationMinutes: number,
    slotInterval: number,
  ): string[] {
    const slots: string[] = [];

    for (const schedule of schedules) {
      let current = this.timeToMinutes(schedule.start_time);
      const end = this.timeToMinutes(schedule.end_time);
      const breakStart = schedule.break_start
        ? this.timeToMinutes(schedule.break_start)
        : null;
      const breakEnd = schedule.break_end
        ? this.timeToMinutes(schedule.break_end)
        : null;

      while (current + durationMinutes <= end) {
        const slotEnd = current + durationMinutes;
        const isBreak =
          breakStart !== null &&
          breakEnd !== null &&
          current < breakEnd &&
          slotEnd > breakStart;

        if (!isBreak) {
          slots.push(this.minutesToTime(current));
        }
        current += slotInterval;
      }
    }

    return slots;
  }

  /**
   * Remove dos candidatos os horários que colidem com agendamentos existentes.
   */
  private async filterOccupiedSlots(
    candidateSlots: string[],
    professionalId: number,
    tenantId: number,
    date: string,
    durationMinutes: number,
  ): Promise<string[]> {
    const startOfDay = new Date(`${date}T00:00:00`);
    const endOfDay = new Date(`${date}T23:59:59`);

    const appointments = await this.appointmentRepo.find({
      where: {
        professional_id: professionalId,
        tenant_id: tenantId,
        status: Not('cancelled'),
        start_time: Between(startOfDay, endOfDay),
      },
    });

    return candidateSlots.filter((slot) => {
      const slotStart = new Date(`${date}T${slot}:00`).getTime();
      const slotEnd = slotStart + durationMinutes * 60000;

      return !appointments.some((appt) => {
        const apptStart = new Date(appt.start_time).getTime();
        const apptEnd = new Date(appt.end_time).getTime();
        return slotStart < apptEnd && slotEnd > apptStart;
      });
    });
  }

  private timeToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  private minutesToTime(minutes: number): string {
    const h = Math.floor(minutes / 60)
      .toString()
      .padStart(2, '0');
    const m = (minutes % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  }
}