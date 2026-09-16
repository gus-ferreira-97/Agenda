import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, Not } from 'typeorm';
import { Appointment } from '../appointment/entities/appointment.entity';
import { Professional } from '../professional/entities/professional.entity';
import { Service } from '../service/entities/service.entity';
import { ServiceOption } from '../service/entities/service-option.entity';

@Injectable()
export class TenantMetricsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,
    @InjectRepository(Professional)
    private readonly professionalRepo: Repository<Professional>,
    @InjectRepository(Service)
    private readonly serviceRepo: Repository<Service>,
  ) { }

  private getPeriodRange(period: number) {
    const now = new Date();
    const currentStart = new Date(now);
    currentStart.setDate(currentStart.getDate() - period);
    currentStart.setHours(0, 0, 0, 0);

    const previousStart = new Date(currentStart);
    previousStart.setDate(previousStart.getDate() - period);

    return { currentStart, previousStart };
  }

  private calcTrend(current: number, previous: number): number | null {
    if (previous === 0) {
      if (current === 0) return 0;
      return null;
    }
    return Math.round(((current - previous) / previous) * 100);
  }

  async getKpis(tenantId: number, period: number = 30) {
    const { currentStart, previousStart } = this.getPeriodRange(period);

    const countIn = (status?: string | string[]) =>
      this.appointmentRepo.count({
        where: {
          tenant_id: tenantId,
          start_time: MoreThanOrEqual(currentStart),
          ...(status
            ? Array.isArray(status)
              ? { status: Not('cancelled') }
              : { status }
            : {}),
        },
      });

    const countPrev = (status?: string) =>
      this.appointmentRepo.count({
        where: {
          tenant_id: tenantId,
          start_time: Between(previousStart, currentStart),
          ...(status ? { status } : { status: Not('cancelled') }),
        },
      });

    const [
      appointmentsCurrent,
      confirmedCurrent,
      pendingCurrent,
      cancelledCurrent,
      appointmentsPrev,
      confirmedPrev,
      pendingPrev,
      cancelledPrev,
      professionals,
    ] = await Promise.all([
      countIn(),
      countIn('confirmed'),
      countIn('pending'),
      countIn('cancelled'),
      countPrev(),
      countPrev('confirmed'),
      countPrev('pending'),
      countPrev('cancelled'),
      this.professionalRepo.count({
        where: { tenant_id: tenantId, is_active: true },
      }),
    ]);

    // Faturamento estimado: usa o preço da variação quando existir, senão o do serviço
    const revenueResult = await this.appointmentRepo
      .createQueryBuilder('a')
      .leftJoin(Service, 's', 's.id = a.service_id')
      .leftJoin(ServiceOption, 'so', 'so.id = a.service_option_id')
      .select('COALESCE(SUM(COALESCE(so.price, s.price)), 0)', 'total')
      .where('a.tenant_id = :tenantId', { tenantId })
      .andWhere('a.start_time >= :since', { since: currentStart })
      .andWhere('a.status IN (:...statuses)', { statuses: ['confirmed', 'completed'] })
      .getRawOne();

    const revenuePrevResult = await this.appointmentRepo
      .createQueryBuilder('a')
      .leftJoin(Service, 's', 's.id = a.service_id')
      .leftJoin(ServiceOption, 'so', 'so.id = a.service_option_id')
      .select('COALESCE(SUM(COALESCE(so.price, s.price)), 0)', 'total')
      .where('a.tenant_id = :tenantId', { tenantId })
      .andWhere('a.start_time >= :start', { start: previousStart })
      .andWhere('a.start_time < :end', { end: currentStart })
      .andWhere('a.status IN (:...statuses)', { statuses: ['confirmed', 'completed'] })
      .getRawOne();

    const revenueCurrent = parseFloat(revenueResult?.total || '0') || 0;
    const revenuePrev = parseFloat(revenuePrevResult?.total || '0') || 0;

    return {
      period,
      appointments: {
        value: appointmentsCurrent,
        trend: this.calcTrend(appointmentsCurrent, appointmentsPrev),
      },
      confirmed: {
        value: confirmedCurrent,
        trend: this.calcTrend(confirmedCurrent, confirmedPrev),
      },
      pending: {
        value: pendingCurrent,
        trend: this.calcTrend(pendingCurrent, pendingPrev),
      },
      cancelled: {
        value: cancelledCurrent,
        trend: this.calcTrend(cancelledCurrent, cancelledPrev),
      },
      professionals: {
        value: professionals,
        trend: null,
      },
      revenue: {
        value: Math.round(revenueCurrent * 100) / 100,
        trend: this.calcTrend(revenueCurrent, revenuePrev),
      },
    };
  }

  async getOverview(tenantId: number, period: number = 30) {
    const [appointmentsPerDay, appointmentsByStatus, appointmentsByWeekday] =
      await Promise.all([
        this.getAppointmentsPerDay(tenantId, period),
        this.getAppointmentsByStatus(tenantId, period),
        this.getAppointmentsByWeekday(tenantId, period),
      ]);

    return { appointmentsPerDay, appointmentsByStatus, appointmentsByWeekday };
  }

  async getTopProfessionals(tenantId: number, period: number = 30) {
    const { currentStart } = this.getPeriodRange(period);

    const rows = await this.appointmentRepo
      .createQueryBuilder('a')
      .leftJoin(Professional, 'p', 'p.id = a.professional_id')
      .select('p.name', 'name')
      .addSelect('COUNT(*)', 'count')
      .where('a.tenant_id = :tenantId', { tenantId })
      .andWhere('a.start_time >= :since', { since: currentStart })
      .andWhere('a.status != :cancelled', { cancelled: 'cancelled' })
      .groupBy('p.name')
      .orderBy('count', 'DESC')
      .limit(5)
      .getRawMany();

    return rows.map((r) => ({
      name: r.name || 'Sem nome',
      count: parseInt(r.count, 10),
    }));
  }

  async getTopServices(tenantId: number, period: number = 30) {
    const { currentStart } = this.getPeriodRange(period);

    const rows = await this.appointmentRepo
      .createQueryBuilder('a')
      .leftJoin(Service, 's', 's.id = a.service_id')
      .select('s.name', 'name')
      .addSelect('COUNT(*)', 'count')
      .where('a.tenant_id = :tenantId', { tenantId })
      .andWhere('a.start_time >= :since', { since: currentStart })
      .andWhere('a.status != :cancelled', { cancelled: 'cancelled' })
      .groupBy('s.name')
      .orderBy('count', 'DESC')
      .limit(5)
      .getRawMany();

    return rows.map((r) => ({
      name: r.name || 'Sem nome',
      count: parseInt(r.count, 10),
    }));
  }

  private async getAppointmentsPerDay(tenantId: number, period: number) {
    const { currentStart } = this.getPeriodRange(period);

    const rows = await this.appointmentRepo
      .createQueryBuilder('a')
      .select("TO_CHAR(a.start_time, 'YYYY-MM-DD')", 'date')
      .addSelect('COUNT(*)', 'count')
      .where('a.tenant_id = :tenantId', { tenantId })
      .andWhere('a.start_time >= :since', { since: currentStart })
      .andWhere('a.status != :cancelled', { cancelled: 'cancelled' })
      .groupBy("TO_CHAR(a.start_time, 'YYYY-MM-DD')")
      .orderBy('date', 'ASC')
      .getRawMany();

    return rows.map((r) => ({
      date: r.date,
      count: parseInt(r.count, 10),
    }));
  }

  private async getAppointmentsByStatus(tenantId: number, period: number) {
    const { currentStart } = this.getPeriodRange(period);

    const rows = await this.appointmentRepo
      .createQueryBuilder('a')
      .select('a.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('a.tenant_id = :tenantId', { tenantId })
      .andWhere('a.start_time >= :since', { since: currentStart })
      .groupBy('a.status')
      .getRawMany();

    return rows.map((r) => ({
      status: r.status,
      count: parseInt(r.count, 10),
    }));
  }

  private async getAppointmentsByWeekday(tenantId: number, period: number) {
    const { currentStart } = this.getPeriodRange(period);

    const rows = await this.appointmentRepo
      .createQueryBuilder('a')
      .select('EXTRACT(DOW FROM a.start_time)', 'weekday')
      .addSelect('COUNT(*)', 'count')
      .where('a.tenant_id = :tenantId', { tenantId })
      .andWhere('a.start_time >= :since', { since: currentStart })
      .andWhere('a.status != :cancelled', { cancelled: 'cancelled' })
      .groupBy('EXTRACT(DOW FROM a.start_time)')
      .orderBy('weekday', 'ASC')
      .getRawMany();

    return rows.map((r) => ({
      weekday: parseInt(r.weekday, 10),
      count: parseInt(r.count, 10),
    }));
  }
}