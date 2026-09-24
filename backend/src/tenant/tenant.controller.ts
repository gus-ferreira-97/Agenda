import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  ForbiddenException,
} from '@nestjs/common';
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateTenantBrandingDto } from './dto/update-tenant-branding.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';


@Controller('tenants')
@Roles('super_admin', 'tenant_admin')
export class TenantController {
  constructor(private readonly tenantService: TenantService) { }

  @Post()
  @Roles('super_admin')
  create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantService.create(createTenantDto);
  }

  @Get()
  @Roles('super_admin')
  findAll() {
    return this.tenantService.findAll();
  }

  @Get('me/branding')
  @Roles('tenant_admin')
  async getMyBranding(@CurrentUser() user: any) {
    if (!user?.tenantId) {
      throw new ForbiddenException('Usuário não associado a um tenant');
    }
    const tenant = await this.tenantService.findOne(user.tenantId);
    return {
      id: tenant.id,
      name: tenant.name,
      subdomain: tenant.subdomain,
      primaryColor: tenant.primary_color,
      logoUrl: tenant.logo_url,
      welcomeMessage: tenant.welcome_message,
      phone: tenant.phone,
      address: tenant.address,
    };
  }

  @Patch('me/branding')
  @Roles('tenant_admin')
  async updateMyBranding(
    @CurrentUser() user: any,
    @Body() dto: UpdateTenantBrandingDto,
  ) {
    if (!user?.tenantId) {
      throw new ForbiddenException('Usuário não associado a um tenant');
    }
    return this.tenantService.updateBranding(user.tenantId, dto);
  }

  @Get('me/plan')
  @Roles('tenant_admin')
  async getMyPlan(@CurrentUser() user: any) {
    if (!user?.tenantId) {
      throw new ForbiddenException('Usuário não associado a um tenant');
    }
    return this.tenantService.getPlanInfo(user.tenantId);
  }

  @Get('me/trial')
  @Roles('tenant_admin')
  async getMyTrial(@CurrentUser() user: any) {
    if (!user?.tenantId) {
      throw new ForbiddenException('Usuário não associado a um tenant');
    }
    return this.tenantService.getTrialInfo(user.tenantId);
  }

  @Get(':id')
  @Roles('super_admin')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tenantService.findOne(id);
  }

  @Patch(':id')
  @Roles('super_admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTenantDto: UpdateTenantDto,
  ) {
    return this.tenantService.update(id, updateTenantDto);
  }

  @Delete(':id')
  @Roles('super_admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tenantService.remove(id);
  }
}