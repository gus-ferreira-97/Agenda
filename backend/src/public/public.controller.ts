import { Controller, Get, Post, Body, Req, BadRequestException, Query } from '@nestjs/common';
import { PublicService } from './public.service';
import { CreateAppointmentPublicDto } from './dto/create-appointment-public.dto';
import { RegisterTenantDto } from './dto/register-tenant.dto';

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

  @Get('available-slots')
  getAvailableSlots(
    @Req() req: any,
    @Query('professionalId') professionalId: string,
    @Query('serviceId') serviceId: string,
    @Query('date') date: string,
  ) {
    if (!req.tenantId) throw new BadRequestException('Tenant não identificado');
    const pid = parseInt(professionalId, 10);
    const sid = parseInt(serviceId, 10);
    if (isNaN(pid) || isNaN(sid) || !date) {
      throw new BadRequestException('Parâmetros inválidos');
    }
    return this.publicService.getAvailableSlots(req.tenantId, pid, sid, date);
  }

  @Post('appointments')
  createAppointment(@Req() req: any, @Body() dto: CreateAppointmentPublicDto) {
    if (!req.tenantId) {
      throw new BadRequestException('Tenant não identificado');
    }
    return this.publicService.createAppointment(req.tenantId, dto);
  }

  @Post('register')
  register(@Body() dto: RegisterTenantDto) {
    return this.publicService.registerTenant(dto);
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