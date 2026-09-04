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
import { WorkScheduleService } from './work-schedule.service';
import { CreateWorkScheduleDto } from './dto/create-work-schedule.dto';
import { UpdateWorkScheduleDto } from './dto/update-work-schedule.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('work-schedules')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin', 'tenant_admin')
export class WorkScheduleController {
  constructor(private readonly workScheduleService: WorkScheduleService) {}

  @Post()
  create(@Body() dto: CreateWorkScheduleDto, @CurrentUser() user: any) {
    return this.workScheduleService.create(dto, user);
  }

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('professionalId') professionalId?: string,
  ) {
    return this.workScheduleService.findAll(
      user,
      professionalId ? parseInt(professionalId, 10) : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.workScheduleService.findOne(id, user);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWorkScheduleDto,
    @CurrentUser() user: any,
  ) {
    return this.workScheduleService.update(id, dto, user);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.workScheduleService.remove(id, user);
  }
}