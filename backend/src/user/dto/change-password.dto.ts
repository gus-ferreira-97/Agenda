import { IsString, IsNotEmpty } from 'class-validator';
import { IsStrongPassword } from '../../common/validators/is-strong-password.decorator';

export class ChangePasswordDto {
  @IsString({ message: 'A senha atual deve ser um texto válido' })
  @IsNotEmpty({ message: 'Informe a senha atual' })
  currentPassword: string;

  @IsString({ message: 'A nova senha deve ser um texto válido' })
  @IsStrongPassword()
  newPassword: string;
}