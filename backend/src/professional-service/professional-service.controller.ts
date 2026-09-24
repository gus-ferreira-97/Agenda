import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ProfessionalServiceService } from './professional-service.service';
import { CreateProfessionalServiceDto } from './dto/create-professional-service.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('professional-services')
@Roles('super_admin', 'tenant_admin')
export class ProfessionalServiceController {
  constructor(private readonly professionalService: ProfessionalServiceService) {}

  @Post()
  create(@Body() dto: CreateProfessionalServiceDto, @CurrentUser() user: any) {
    return this.professionalService.create(dto, user);
  }

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('professionalId') professionalId?: string,
    @Query('serviceId') serviceId?: string,
  ) {
    return this.professionalService.findAll(
      user,
      professionalId ? parseInt(professionalId, 10) : undefined,
      serviceId ? parseInt(serviceId, 10) : undefined,
    );
  }

  @Delete(':professionalId/:serviceId')
  remove(
    @Param('professionalId', ParseIntPipe) professionalId: number,
    @Param('serviceId', ParseIntPipe) serviceId: number,
    @CurrentUser() user: any,
  ) {
    return this.professionalService.remove(professionalId, serviceId, user);
  }
}