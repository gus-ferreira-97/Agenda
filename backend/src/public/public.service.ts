import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, Between, LessThan, MoreThan } from 'typeorm';
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
  ) { }

  async registerTenant(dto: RegisterTenantDto): Promise<{ message: string }> {

    // Honeypot: se o campo `_hp` estiver preenchido, é bot
    if (dto._hp && dto._hp.trim() !== '') {
      throw new BadRequestException('Requisição inválida.');
    }

    const subdomain = dto.subdomain
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const existingTenant = await this.tenantRepo.findOne({
      where: { subdomain },
    });
    if (existingTenant) {
      throw new ConflictException('Este subdomínio já está em uso');
    }

    const existingUser = await this.userRepo.findOne({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('Este e-mail já está cadastrado');
    }

    const tenant = this.tenantRepo.create({
      name: dto.tenantName,
      subdomain,
      status: 'aguardando_verificacao',
      plan: dto.plan || 'basico',
    });
    const savedTenant = await this.tenantRepo.save(tenant);

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({
      name: dto.ownerName,
      email: dto.email,
      password_hash: hashedPassword,
      role: 'tenant_admin',
      tenant_id: savedTenant.id,
      email_verified: false,
    });
    const savedUser = await this.userRepo.save(user);

    // Gera token de verificação de e-mail (válido por 24h)
    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    savedUser.email_verification_token = token;
    savedUser.email_verification_expires = expires;
    await this.userRepo.save(savedUser);

    // Envia o e-mail de verificação
    await this.mailService.sendEmailVerificationEmail(savedUser.email, token);

    return {
      message:
        'Conta criada com sucesso! Enviamos um e-mail de confirmação. Verifique sua caixa de entrada para ativar sua conta.',
    };
  }

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

  async getAvailableSlots(
    tenantId: number,
    professionalId: number,
    serviceId: number,
    date: string,
    serviceOptionId?: number,
  ): Promise<string[]> {
    const professional = await this.professionalRepo.findOne({
      where: { id: professionalId, tenant_id: tenantId, is_active: true },
    });
    if (!professional) throw new NotFoundException('Profissional não encontrado');

    const service = await this.serviceRepo.findOne({
      where: { id: serviceId, tenant_id: tenantId, is_active: true },
    });
    if (!service) throw new NotFoundException('Serviço não encontrado');

    // Se informou uma variação, valida e usa a duração dela
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

    const config = await this.tenantConfigRepo.findOne({ where: { tenant_id: tenantId } });
    const slotInterval = config?.slot_interval || 30;
    const timezone = config?.timezone || 'America/Sao_Paulo';

    // Determina dia da semana (0 = domingo)
    const dateObj = new Date(`${date}T12:00:00`);
    const dayOfWeek = dateObj.getUTCDay(); // simplificado; ajustar timezone depois

    const schedules = await this.workScheduleRepo.find({
      where: { professional_id: professionalId, tenant_id: tenantId, day_of_week: dayOfWeek },
    });
    if (schedules.length === 0) return [];

    // Usa a duração da variação, se informada; senão, a do serviço
    const duration = serviceOption?.duration_minutes ?? service.duration_minutes;
    const slots: string[] = [];

    for (const schedule of schedules) {
      let current = this.timeToMinutes(schedule.start_time);
      const end = this.timeToMinutes(schedule.end_time);
      const breakStart = schedule.break_start ? this.timeToMinutes(schedule.break_start) : null;
      const breakEnd = schedule.break_end ? this.timeToMinutes(schedule.break_end) : null;

      while (current + duration <= end) {
        const slotEnd = current + duration;
        const isBreak = breakStart !== null && breakEnd !== null && current < breakEnd && slotEnd > breakStart;
        if (!isBreak) {
          slots.push(this.minutesToTime(current));
        }
        current += slotInterval;
      }
    }

    // Remove slots ocupados
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

    const freeSlots = slots.filter((slot) => {
      // Cria a data/hora local do slot usando a string da data e o horário (assume fuso local do servidor, que deve ser o mesmo do tenant no MVP)
      const slotStart = new Date(`${date}T${slot}:00`);
      const slotEnd = new Date(slotStart.getTime() + duration * 60000);

      // Compara com os agendamentos existentes usando timestamps (em milissegundos)
      return !appointments.some((appt) => {
        const apptStart = new Date(appt.start_time).getTime();
        const apptEnd = new Date(appt.end_time).getTime();
        return slotStart.getTime() < apptEnd && slotEnd.getTime() > apptStart;
      });
    });

    return freeSlots;
  }

  async createAppointment(tenantId: number, dto: CreateAppointmentPublicDto): Promise<Appointment> {

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

    // Valida o serviço (pertence ao tenant e está ativo)
    const service = await this.serviceRepo.findOne({
      where: { id: serviceId, tenant_id: tenantId, is_active: true },
    });
    if (!service) throw new NotFoundException('Serviço não encontrado');

    // Se informou uma variação, valida que ela existe, pertence ao serviço e está ativa
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

    // Usa a duração da variação, se informada; senão, a do serviço
    const durationMinutes = serviceOption?.duration_minutes ?? service.duration_minutes;
    const end = new Date(start.getTime() + durationMinutes * 60000);

    // Verifica conflito diretamente
    const conflict = await this.appointmentRepo.findOne({
      where: {
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

    return this.appointmentRepo.save(appointment);
  }

  private timeToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  private minutesToTime(minutes: number): string {
    const h = Math.floor(minutes / 60).toString().padStart(2, '0');
    const m = (minutes % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
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

  async getProfessionalServices(tenantId: number) {
    const rows = await this.professionalServiceRepo.find({
      where: { tenant_id: tenantId },
      select: ['professional_id', 'service_id'],
    });
    return rows;
  }

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

    if (!user.email_verification_expires || user.email_verification_expires < new Date()) {
      throw new BadRequestException('Token expirado. Solicite um novo link.');
    }

    if (user.email_verified) {
      return { message: 'E-mail já verificado. Você pode fazer login.' };
    }

    // Marca como verificado e limpa o token
    user.email_verified = true;
    user.email_verification_token = null;
    user.email_verification_expires = null;
    await this.userRepo.save(user);

    // Move o tenant de "aguardando_verificacao" para "pendente" (aguardando aprovação)
    if (user.tenant_id) {
      const tenant = await this.tenantRepo.findOne({ where: { id: user.tenant_id } });
      if (tenant && tenant.status === 'aguardando_verificacao') {
        tenant.status = 'pendente';
        await this.tenantRepo.save(tenant);
      }
    }

    return {
      message:
        'E-mail verificado com sucesso! Sua conta está em análise e você receberá uma notificação quando for ativada.',
    };
  }

  async getServiceOptions(tenantId: number, serviceId: number) {
    // Valida que o serviço pertence ao tenant e está ativo
    const service = await this.serviceRepo.findOne({
      where: { id: serviceId, tenant_id: tenantId, is_active: true },
    });
    if (!service) {
      throw new NotFoundException('Serviço não encontrado');
    }

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

  getPublicPlans() {
    return getPublicPlans();
  }
}