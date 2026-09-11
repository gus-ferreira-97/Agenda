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
  role: string;

  @IsOptional()
  @IsInt()
  tenantId?: number;
}