import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ProfessionalService } from './professional.service';
import { CreateProfessionalDto } from './dto/create-professional.dto';
import { UpdateProfessionalDto } from './dto/update-professional.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('professionals')
@Roles('super_admin', 'tenant_admin')
export class ProfessionalController {
  constructor(private readonly professionalService: ProfessionalService) { }

  @Post()
  create(@Body() createProfessionalDto: CreateProfessionalDto, @CurrentUser() user: any) {
    return this.professionalService.create(createProfessionalDto, user);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.professionalService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.professionalService.findOne(id, user);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProfessionalDto: UpdateProfessionalDto,
    @CurrentUser() user: any,
  ) {
    return this.professionalService.update(id, updateProfessionalDto, user);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.professionalService.remove(id, user);
  }
}