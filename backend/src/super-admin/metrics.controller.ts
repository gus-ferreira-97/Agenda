import { Controller, Get, Query } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('super-admin/metrics')
@Roles('super_admin')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('kpis')
  getKpis(@Query('period') period?: string) {
    return this.metricsService.getKpis(period ? parseInt(period, 10) : 30);
  }

  @Get('overview')
  getOverview(@Query('period') period?: string) {
    return this.metricsService.getOverview(period ? parseInt(period, 10) : 30);
  }

  @Get('top-tenants')
  getTopTenants(@Query('period') period?: string) {
    return this.metricsService.getTopTenants(period ? parseInt(period, 10) : 30);
  }

  @Get('appointments-by-status')
  getAppointmentsByStatus(@Query('period') period?: string) {
    return this.metricsService.getAppointmentsByStatus(period ? parseInt(period, 10) : 30);
  }
}