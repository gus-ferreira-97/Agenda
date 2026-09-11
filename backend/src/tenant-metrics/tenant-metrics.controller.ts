import {
  Controller,
  Get,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { TenantMetricsService } from './tenant-metrics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('tenant-metrics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('tenant_admin')
export class TenantMetricsController {
  constructor(private readonly metricsService: TenantMetricsService) {}

  private getTenantId(user: any): number {
    if (!user?.tenantId) {
      throw new ForbiddenException('Usuário não associado a um tenant');
    }
    return user.tenantId;
  }

  @Get('kpis')
  getKpis(@CurrentUser() user: any, @Query('period') period?: string) {
    return this.metricsService.getKpis(
      this.getTenantId(user),
      period ? parseInt(period, 10) : 30,
    );
  }

  @Get('overview')
  getOverview(@CurrentUser() user: any, @Query('period') period?: string) {
    return this.metricsService.getOverview(
      this.getTenantId(user),
      period ? parseInt(period, 10) : 30,
    );
  }

  @Get('top-professionals')
  getTopProfessionals(@CurrentUser() user: any, @Query('period') period?: string) {
    return this.metricsService.getTopProfessionals(
      this.getTenantId(user),
      period ? parseInt(period, 10) : 30,
    );
  }

  @Get('top-services')
  getTopServices(@CurrentUser() user: any, @Query('period') period?: string) {
    return this.metricsService.getTopServices(
      this.getTenantId(user),
      period ? parseInt(period, 10) : 30,
    );
  }
}