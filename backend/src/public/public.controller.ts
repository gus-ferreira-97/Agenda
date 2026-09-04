import { Controller, Get, Post, Body, Query, BadRequestException } from '@nestjs/common';
import { PublicService } from './public.service';
import { CreateAppointmentPublicDto } from './dto/create-appointment-public.dto';

@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('professionals')
  getProfessionals(@Query('tenantId') tenantId: string) {
    const id = parseInt(tenantId, 10);
    if (isNaN(id)) throw new BadRequestException('tenantId inválido');
    return this.publicService.getProfessionals(id);
  }

  @Get('services')
  getServices(@Query('tenantId') tenantId: string) {
    const id = parseInt(tenantId, 10);
    if (isNaN(id)) throw new BadRequestException('tenantId inválido');
    return this.publicService.getServices(id);
  }

  @Get('available-slots')
  getAvailableSlots(
    @Query('tenantId') tenantId: string,
    @Query('professionalId') professionalId: string,
    @Query('serviceId') serviceId: string,
    @Query('date') date: string,
  ) {
    const tid = parseInt(tenantId, 10);
    const pid = parseInt(professionalId, 10);
    const sid = parseInt(serviceId, 10);
    if (isNaN(tid) || isNaN(pid) || isNaN(sid) || !date) {
      throw new BadRequestException('Parâmetros inválidos');
    }
    return this.publicService.getAvailableSlots(tid, pid, sid, date);
  }

  @Post('appointments')
  createAppointment(@Body() dto: CreateAppointmentPublicDto) {
    return this.publicService.createAppointment(dto);
  }
}