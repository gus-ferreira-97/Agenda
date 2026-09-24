import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsInt,
  IsIn,
} from 'class-validator';
import { IsStrongPassword } from '../../common/validators/is-strong-password.decorator';
import { SanitizeHtml } from '../../common/validators/sanitize-html.decorator';

export class CreateUserDto {
  @IsString({ message: 'O nome deve ser um texto válido' })
  @IsNotEmpty({ message: 'Informe o nome do usuário' })
  @SanitizeHtml()
  name: string;

  @IsEmail({}, { message: 'Informe um e-mail válido' })
  @IsNotEmpty({ message: 'Informe o e-mail' })
  email: string;

  @IsString({ message: 'A senha deve ser um texto válido' })
  @IsStrongPassword()
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