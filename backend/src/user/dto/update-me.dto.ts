import { IsString, IsEmail, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { SanitizeHtml } from '../../common/validators/sanitize-html.decorator';

export class UpdateMeDto {
  @IsOptional()
  @IsString({ message: 'O nome deve ser um texto válido' })
  @IsNotEmpty({ message: 'O nome não pode ficar em branco' })
  @MaxLength(255, { message: 'O nome deve ter no máximo 255 caracteres' })
  @SanitizeHtml()
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Informe um e-mail válido' })
  @MaxLength(255, { message: 'O e-mail deve ter no máximo 255 caracteres' })
  email?: string;
}