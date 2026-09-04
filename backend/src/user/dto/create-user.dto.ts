import { IsString, IsEmail, IsNotEmpty, MinLength, IsOptional, IsInt } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  role: string; // 'super_admin' ou 'tenant_admin'

  @IsOptional()
  @IsInt()
  tenantId?: number; // opcional para super_admin
}