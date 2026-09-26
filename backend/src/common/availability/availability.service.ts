import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, Between } from 'typeorm';
import { Professional } from '../../professional/entities/professional.entity';
import { Service } from '../../service/entities/service.entity';
import { ServiceOption } from '../../service/entities/service-option.entity';
import { WorkSchedule } from '../../professional/entities/work-schedule.entity';
import { TenantConfig } from '../../tenant/entities/tenant-config.entity';
import { Appointment } from '../../appointment/entities/appointment.entity';

const DEFAULT_SLOT_INTERVAL = 30;
const DEFAULT_TIMEZONE = 'America/Sao_Paulo';

/**
 * Serviço único de cálculo de disponibilidade.
 * Usado por:
 *  - PublicController (booking público)
 *  - AppointmentController (painel do tenant)
 *
 * Lógica unificada para garantir consistência entre os dois fluxos.
 */
@Injectable()
export class AvailabilityService {
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
  ) {}

  /**
   * Calcula os horários disponíveis para um profissional/serviço em uma data.
   *
   * @param tenantId ID do tenant (isolamento multi-tenant)
   * @param professionalId profissional
   * @param serviceId serviço
   * @param date data no formato YYYY-MM-DD
   * @param serviceOptionId variação opcional (usa duração própria se informada)
   * @returns array de strings "HH:mm"
   */
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

    // 2. Resolve config do tenant
    const config = await this.resolveTenantConfig(tenantId);
    const slotInterval = config.slot_interval || DEFAULT_SLOT_INTERVAL;

    // 3. Determina dia da semana
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
      tenantId,
      professionalId,
      date,
      durationMinutes,
    );
  }

  // ============================================================================
  // VALIDAÇÕES
  // ============================================================================

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

  private async validateServiceAndOption(
    tenantId: number,
    serviceId: number,
    serviceOptionId?: number,
  ): Promise<{
    service: Service;
    serviceOption: ServiceOption | null;
    durationMinutes: number;
  }> {
    const service = await this.serviceRepo.findOne({
      where: { id: serviceId, tenant_id: tenantId, is_active: true },
    });
    if (!service) {
      throw new NotFoundException('Serviço não encontrado');
    }

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

  private async resolveTenantConfig(tenantId: number): Promise<TenantConfig> {
    const config = await this.tenantConfigRepo.findOne({
      where: { tenant_id: tenantId },
    });
    if (config) return config;

    // Config padrão (não persistida — só para uso em memória)
    return this.tenantConfigRepo.create({
      tenant_id: tenantId,
      slot_interval: DEFAULT_SLOT_INTERVAL,
      timezone: DEFAULT_TIMEZONE,
    });
  }

  // ============================================================================
  // CÁLCULO DE SLOTS
  // ============================================================================

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

  private async filterOccupiedSlots(
    candidateSlots: string[],
    tenantId: number,
    professionalId: number,
    date: string,
    durationMinutes: number,
  ): Promise<string[]> {
    const startOfDay = new Date(`${date}T00:00:00`);
    const endOfDay = new Date(`${date}T23:59:59`);

    const appointments = await this.appointmentRepo.find({
      where: {
        tenant_id: tenantId,
        professional_id: professionalId,
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

  // ============================================================================
  // HELPERS
  // ============================================================================

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