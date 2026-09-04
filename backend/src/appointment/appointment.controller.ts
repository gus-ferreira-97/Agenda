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
  UseGuards,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin', 'tenant_admin')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Get('available-slots')
  findAvailableSlots(
    @Query('professionalId', ParseIntPipe) professionalId: number,
    @Query('serviceId', ParseIntPipe) serviceId: number,
    @Query('date') date: string,
    @CurrentUser() user: any,
  ) {
    return this.appointmentService.findAvailableSlots(professionalId, serviceId, date, user);
  }

  @Post()
  create(@Body() createAppointmentDto: CreateAppointmentDto, @CurrentUser() user: any) {
    return this.appointmentService.create(createAppointmentDto, user);
  }

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('professionalId') professionalId?: string,
    @Query('serviceId') serviceId?: string,
    @Query('date') date?: string,
  ) {
    return this.appointmentService.findAll(user, {
      professionalId: professionalId ? parseInt(professionalId, 10) : undefined,
      serviceId: serviceId ? parseInt(serviceId, 10) : undefined,
      date,
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