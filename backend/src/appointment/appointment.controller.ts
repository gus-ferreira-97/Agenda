import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AvailabilityService } from '../common/availability/availability.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('appointments')
@Roles('super_admin', 'tenant_admin')
export class AppointmentController {
  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly availabilityService: AvailabilityService,
  ) {}

  /**
   * Disponibilidade de horários para agendamento pelo painel.
   * Restrito a tenant_admin (super_admin não agenda em nome de tenants).
   */
  @Get('available-slots')
  @Roles('tenant_admin')
  findAvailableSlots(
    @Query('professionalId', ParseIntPipe) professionalId: number,
    @Query('serviceId', ParseIntPipe) serviceId: number,
    @Query('date') date: string,
    @Query('serviceOptionId') serviceOptionId: string | undefined,
    @CurrentUser() user: any,
  ) {
    const soid = serviceOptionId ? parseInt(serviceOptionId, 10) : undefined;
    return this.availabilityService.getAvailableSlots(
      user.tenantId,
      professionalId,
      serviceId,
      date,
      soid,
    );
  }

  @Post()
  create(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @CurrentUser() user: any,
  ) {
    return this.appointmentService.create(createAppointmentDto, user);
  }

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query() pagination: PaginationDto,
    @Query('professionalId') professionalId?: string,
    @Query('serviceId') serviceId?: string,
    @Query('date') date?: string,
  ) {
    return this.appointmentService.findAll(user, {
      professionalId: professionalId ? parseInt(professionalId, 10) : undefined,
      serviceId: serviceId ? parseInt(serviceId, 10) : undefined,
      date,
      page: pagination.page,
      limit: pagination.limit,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.appointmentService.findOne(id, user);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
    @CurrentUser() user: any,
  ) {
    return this.appointmentService.update(id, updateAppointmentDto, user);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.appointmentService.remove(id, user);
  }
}