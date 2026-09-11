import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('super-admin/metrics')
@UseGuards(JwtAuthGuard, RolesGuard)
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