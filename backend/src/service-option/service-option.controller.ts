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
import { ServiceOptionService } from './service-option.service';
import { CreateServiceOptionDto } from './dto/create-service-option.dto';
import { UpdateServiceOptionDto } from './dto/update-service-option.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('service-options')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin', 'tenant_admin')
export class ServiceOptionController {
  constructor(private readonly serviceOptionService: ServiceOptionService) {}

  @Post()
  @Roles('tenant_admin')
  create(@Body() dto: CreateServiceOptionDto, @CurrentUser() user: any) {
    return this.serviceOptionService.create(dto, user);
  }

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('serviceId') serviceId?: string,
  ) {
    return this.serviceOptionService.findAll(
      user,
      serviceId ? parseInt(serviceId, 10) : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.serviceOptionService.findOne(id, user);
  }

  @Patch(':id')
  @Roles('tenant_admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateServiceOptionDto,
    @CurrentUser() user: any,
  ) {
    return this.serviceOptionService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles('tenant_admin')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.serviceOptionService.remove(id, user);
  }
}