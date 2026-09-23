import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) { }

  // ============ ENDPOINTS DO PRÓPRIO USUÁRIO ============
  // Devem vir ANTES de :id para não serem capturados pelo parâmetro

  @Get('me')
  @Roles('super_admin', 'tenant_admin')
  getMe(@CurrentUser() user: any) {
    return this.userService.findMe(user.userId);
  }

  @Patch('me')
  @Roles('super_admin', 'tenant_admin')
  updateMe(@CurrentUser() user: any, @Body() dto: UpdateMeDto) {
    return this.userService.updateMe(user.userId, dto);
  }

  @Patch('me/password')
  @Roles('super_admin', 'tenant_admin')
  changePassword(@CurrentUser() user: any, @Body() dto: ChangePasswordDto) {
    return this.userService.changePassword(user.userId, dto);
  }

  // ============ ENDPOINTS DO SUPER ADMIN ============

  @Post()
  @Roles('super_admin')
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @Roles('super_admin')
  findAll() {
    return this.userService.findAll();
  }

  @Delete('me')
  @Roles('super_admin', 'tenant_admin')
  async deleteMe(@CurrentUser() user: any) {
    return this.userService.anonymizeAndDeactivate(user.userId, user);
  }

  @Get(':id')
  @Roles('super_admin')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @Roles('super_admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: any,
  ) {
    return this.userService.update(id, updateUserDto, user);
  }

  @Delete(':id')
  @Roles('super_admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}