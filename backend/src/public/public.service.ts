import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, Between, LessThan, MoreThan } from 'typeorm';
import { Professional } from '../professional/entities/professional.entity';
import { Service } from '../service/entities/service.entity';
import { WorkSchedule } from '../professional/entities/work-schedule.entity';
import { TenantConfig } from '../tenant/entities/tenant-config.entity';
import { Appointment } from '../appointment/entities/appointment.entity';
import { CreateAppointmentPublicDto } from './dto/create-appointment-public.dto';

@Injectable()
export class PublicService {
  constructor(
    @InjectRepository(Professional)
    private readonly professionalRepo: Repository<Professional>,
    @InjectRepository(Service)
    private readonly serviceRepo: Repository<Service>,
    @InjectRepository(WorkSchedule)
    private readonly workScheduleRepo: Repository<WorkSchedule>,
    @InjectRepository(TenantConfig)
    private readonly tenantConfigRepo: Repository<TenantConfig>,
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,
  ) { }

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
    date: string, // YYYY-MM-DD
  ): Promise<string[]> {
    const professional = await this.professionalRepo.findOne({
      where: { id: professionalId, tenant_id: tenantId, is_active: true },
    });
    if (!professional) throw new NotFoundException('Profissional não encontrado');

    const service = await this.serviceRepo.findOne({
      where: { id: serviceId, tenant_id: tenantId, is_active: true },
    });
    if (!service) throw new NotFoundException('Serviço não encontrado');

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

    const duration = service.duration_minutes;
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

  async createAppointment(dto: CreateAppointmentPublicDto): Promise<Appointment> {
    const { tenantId, professionalId, serviceId, customerName, customerContact, startTime, notes } = dto;

    const start = new Date(startTime);
    if (isNaN(start.getTime())) {
      throw new BadRequestException('Data/hora inválida');
    }

    const service = await this.serviceRepo.findOne({ where: { id: serviceId } });
    if (!service) throw new NotFoundException('Serviço não encontrado');

    const end = new Date(start.getTime() + service.duration_minutes * 60000);

    // Verifica conflito diretamente
    const conflict = await this.appointmentRepo.findOne({
      where: {
        professional_id: professionalId,
        tenant_id: tenantId,
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
}