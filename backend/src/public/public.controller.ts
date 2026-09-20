import { Controller, Get, Post, Body, Query, Param, Req, BadRequestException, ParseIntPipe } from '@nestjs/common';
import { PublicService } from './public.service';
import { CreateAppointmentPublicDto } from './dto/create-appointment-public.dto';
import { RegisterTenantDto } from './dto/register-tenant.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) { }

  @Get('professionals')
  getProfessionals(@Req() req: any) {
    if (!req.tenantId) throw new BadRequestException('Tenant não identificado');
    return this.publicService.getProfessionals(req.tenantId);
  }

  @Get('services')
  getServices(@Req() req: any) {
    if (!req.tenantId) throw new BadRequestException('Tenant não identificado');
    return this.publicService.getServices(req.tenantId);
  }

  @Get('plans')
  getPlans() {
    return this.publicService.getPublicPlans();
  }

  @Get('services/:id/options')
  getServiceOptions(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    if (!req.tenantId) throw new BadRequestException('Tenant não identificado');
    return this.publicService.getServiceOptions(req.tenantId, id);
  }

  @Get('available-slots')
  getAvailableSlots(
    @Req() req: any,
    @Query('professionalId') professionalId: string,
    @Query('serviceId') serviceId: string,
    @Query('date') date: string,
    @Query('serviceOptionId') serviceOptionId?: string,
  ) {
    if (!req.tenantId) throw new BadRequestException('Tenant não identificado');
    const pid = parseInt(professionalId, 10);
    const sid = parseInt(serviceId, 10);
    const soid = serviceOptionId ? parseInt(serviceOptionId, 10) : undefined;
    if (isNaN(pid) || isNaN(sid) || !date) {
      throw new BadRequestException('Parâmetros inválidos');
    }
    if (serviceOptionId && isNaN(soid as number)) {
      throw new BadRequestException('Variação inválida');
    }
    return this.publicService.getAvailableSlots(req.tenantId, pid, sid, date, soid);
  }

  @Post('appointments')
  @Throttle({ default: { limit: 10, ttl: 3600000, blockDuration: 3600000 } })
  createAppointment(@Req() req: any, @Body() dto: CreateAppointmentPublicDto) {
    if (!req.tenantId) {
      throw new BadRequestException('Tenant não identificado');
    }
    return this.publicService.createAppointment(req.tenantId, dto);
  }

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 3600000, blockDuration: 3600000 } })
  register(@Body() dto: RegisterTenantDto) {
    return this.publicService.registerTenant(dto);
  }

  @Post('verify-email')
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.publicService.verifyEmail(dto.token);
  }

  @Get('tenant-info')
  getTenantInfo(@Req() req: any) {
    if (!req.tenantSubdomain) {
      throw new BadRequestException('Subdomínio não identificado');
    }
    return this.publicService.getTenantInfo(req.tenantSubdomain);
  }

  @Get('professional-services')
  getProfessionalServices(@Req() req: any) {
    if (!req.tenantId) throw new BadRequestException('Tenant não identificado');
    return this.publicService.getProfessionalServices(req.tenantId);
  }
}