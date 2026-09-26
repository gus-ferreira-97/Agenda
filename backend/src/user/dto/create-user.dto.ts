import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsIn,
  MaxLength,
} from 'class-validator';
import { IsStrongPassword } from '../../common/validators/is-strong-password.decorator';
import { SanitizeHtml } from '../../common/validators/sanitize-html.decorator';

export class CreateUserDto {
  @IsString({ message: 'O nome deve ser um texto válido' })
  @IsNotEmpty({ message: 'Informe o nome do usuário' })
  @MaxLength(255, { message: 'O nome deve ter no máximo 255 caracteres' })
  @SanitizeHtml()
  name: string;

  @IsEmail({}, { message: 'Informe um e-mail válido' })
  @IsNotEmpty({ message: 'Informe o e-mail' })
  @MaxLength(255, { message: 'O e-mail deve ter no máximo 255 caracteres' })
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