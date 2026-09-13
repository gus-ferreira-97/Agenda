import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsInt,
  IsIn,
} from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'O nome deve ser um texto válido' })
  @IsNotEmpty({ message: 'Informe o nome do usuário' })
  name: string;

  @IsEmail({}, { message: 'Informe um e-mail válido' })
  @IsNotEmpty({ message: 'Informe o e-mail' })
  email: string;

  @IsString({ message: 'A senha deve ser um texto válido' })
  @MinLength(6, {
    message: 'A senha deve ter pelo menos 6 caracteres',
  })
  password: string;

  @IsString({ message: 'O papel deve ser um texto válido' })
  @IsIn(['super_admin', 'tenant_admin'], {
    message: 'O papel deve ser super_admin ou tenant_admin',
  })
  role: string;

  @IsOptional()
  @IsInt({ message: 'O tenant é inválido' })
  tenantId?: number;
}