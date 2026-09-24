import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, Not } from 'typeorm';
import { Appointment } from '../appointment/entities/appointment.entity';
import { Tenant } from '../tenant/entities/tenant.entity';
import { Professional } from '../professional/entities/professional.entity';
import { Service } from '../service/entities/service.entity';

@Injectable()
export class MetricsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
    @InjectRepository(Professional)
    private readonly professionalRepo: Repository<Professional>,
    @InjectRepository(Service)
    private readonly serviceRepo: Repository<Service>,
  ) {}

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

  async getKpis(period: number = 30) {
    const { currentStart, previousStart } = this.getPeriodRange(period);

    // Totais (todos os tempos)
    const [tenantsTotal, professionalsTotal, servicesTotal] = await Promise.all([
      this.tenantRepo.count(),
      this.professionalRepo.count({ where: { is_active: true } }),
      this.serviceRepo.count({ where: { is_active: true } }),
    ]);

    // Novos no período atual
    const [newTenantsCurrent, newProfessionalsCurrent, newServicesCurrent] =
      await Promise.all([
        this.tenantRepo.count({ where: { created_at: MoreThanOrEqual(currentStart) } }),
        this.professionalRepo.count({ where: { created_at: MoreThanOrEqual(currentStart) } }),
        this.serviceRepo.count({ where: { created_at: MoreThanOrEqual(currentStart) } }),
      ]);

    // Novos no período anterior
    const [newTenantsPrev, newProfessionalsPrev, newServicesPrev] = await Promise.all([
      this.tenantRepo.count({ where: { created_at: Between(previousStart, currentStart) } }),
      this.professionalRepo.count({ where: { created_at: Between(previousStart, currentStart) } }),
      this.serviceRepo.count({ where: { created_at: Between(previousStart, currentStart) } }),
    ]);

    // Agendamentos (não cancelados) no período
    const [appointmentsCurrent, appointmentsPrev] = await Promise.all([
      this.appointmentRepo.count({
        where: { start_time: MoreThanOrEqual(currentStart), status: Not('cancelled') },
      }),
      this.appointmentRepo.count({
        where: { start_time: Between(previousStart, currentStart), status: Not('cancelled') },
      }),
    ]);

    // Cancelados no período
    const [cancelledCurrent, cancelledPrev] = await Promise.all([
      this.appointmentRepo.count({
        where: { start_time: MoreThanOrEqual(currentStart), status: 'cancelled' },
      }),
      this.appointmentRepo.count({
        where: { start_time: Between(previousStart, currentStart), status: 'cancelled' },
      }),
    ]);

    const totalCurrent = appointmentsCurrent + cancelledCurrent;
    const totalPrev = appointmentsPrev + cancelledPrev;
    const cancellationRateCurrent =
      totalCurrent > 0 ? (cancelledCurrent / totalCurrent) * 100 : 0;

    // Conversão (baseada em status atual)
    const tenantsByStatus = await this.tenantRepo
      .createQueryBuilder('t')
      .select('t.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('t.status')
      .getRawMany();

    const total = tenantsByStatus.reduce((sum, t) => sum + parseInt(t.count, 10), 0);
    const activated = parseInt(
      tenantsByStatus.find((t) => t.status === 'ativo')?.count || '0',
      10,
    );
    const pending = parseInt(
      tenantsByStatus.find((t) => t.status === 'pendente')?.count || '0',
      10,
    );
    const suspended = parseInt(
      tenantsByStatus.find((t) => t.status === 'suspenso')?.count || '0',
      10,
    );
    const conversionRate = total > 0 ? Math.round((activated / total) * 100) : 0;

    return {
      period,
      tenants: {
        value: tenantsTotal,
        trend: this.calcTrend(newTenantsCurrent, newTenantsPrev),
      },
      professionals: {
        value: professionalsTotal,
        trend: this.calcTrend(newProfessionalsCurrent, newProfessionalsPrev),
      },
      services: {
        value: servicesTotal,
        trend: this.calcTrend(newServicesCurrent, newServicesPrev),
      },
      appointments: {
        value: appointmentsCurrent,
        trend: this.calcTrend(appointmentsCurrent, appointmentsPrev),
      },
      conversion: {
        value: conversionRate,
        trend: null,
        total,
        activated,
        pending,
        suspended,
      },
      cancellation: {
        value: Math.round(cancellationRateCurrent),
        trend: this.calcTrend(cancelledCurrent, cancelledPrev),
        cancelled: cancelledCurrent,
      },
    };
  }

  async getOverview(period: number = 30) {
    const [appointmentsPerDay, tenantsByStatus, newTenantsPerMonth] =
      await Promise.all([
        this.getAppointmentsPerDay(period),
        this.getTenantsByStatus(),
        this.getNewTenantsPerMonth(),
      ]);

    return { appointmentsPerDay, tenantsByStatus, newTenantsPerMonth };
  }

  async getTopTenants(period: number = 30) {
    const { currentStart } = this.getPeriodRange(period);

    const rows = await this.appointmentRepo
      .createQueryBuilder('a')
      .leftJoin(Tenant, 't', 't.id = a.tenant_id')
      .select('t.name', 'name')
      .addSelect('COUNT(*)', 'count')
      .where('a.status != :cancelled', { cancelled: 'cancelled' })
      .andWhere('a.start_time >= :since', { since: currentStart })
      .groupBy('t.name')
      .orderBy('count', 'DESC')
      .limit(5)
      .getRawMany();

    return rows.map((r) => ({
      name: r.name || 'Sem nome',
      count: parseInt(r.count, 10),
    }));
  }

  async getAppointmentsByStatus(period: number = 30) {
    const { currentStart } = this.getPeriodRange(period);

    const rows = await this.appointmentRepo
      .createQueryBuilder('a')
      .select('a.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('a.start_time >= :since', { since: currentStart })
      .groupBy('a.status')
      .getRawMany();

    return rows.map((r) => ({
      status: r.status,
      count: parseInt(r.count, 10),
    }));
  }

  private async getAppointmentsPerDay(period: number) {
    const { currentStart } = this.getPeriodRange(period);

    const rows = await this.appointmentRepo
      .createQueryBuilder('a')
      .select("TO_CHAR(a.start_time, 'YYYY-MM-DD')", 'date')
      .addSelect('COUNT(*)', 'count')
      .where('a.start_time >= :since', { since: currentStart })
      .andWhere('a.status != :cancelled', { cancelled: 'cancelled' })
      .groupBy("TO_CHAR(a.start_time, 'YYYY-MM-DD')")
      .orderBy('date', 'ASC')
      .getRawMany();

    return rows.map((r) => ({
      date: r.date,
      count: parseInt(r.count, 10),
    }));
  }

  private async getTenantsByStatus() {
    const rows = await this.tenantRepo
      .createQueryBuilder('t')
      .select('t.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('t.status')
      .getRawMany();

    return rows.map((r) => ({
      status: r.status,
      count: parseInt(r.count, 10),
    }));
  }

  private async getNewTenantsPerMonth() {
    const since = new Date();
    since.setMonth(since.getMonth() - 5);
    since.setDate(1);
    since.setHours(0, 0, 0, 0);

    const rows = await this.tenantRepo
      .createQueryBuilder('t')
      .select("TO_CHAR(t.created_at, 'YYYY-MM')", 'month')
      .addSelect('COUNT(*)', 'count')
      .where('t.created_at >= :since', { since })
      .groupBy("TO_CHAR(t.created_at, 'YYYY-MM')")
      .orderBy('month', 'ASC')
      .getRawMany();

    return rows.map((r) => ({
      month: r.month,
      count: parseInt(r.count, 10),
    }));
  }
}