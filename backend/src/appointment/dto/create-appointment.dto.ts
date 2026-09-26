import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsDateString,
  IsIn,
  MaxLength,
} from 'class-validator';
import { SanitizeHtml } from '../../common/validators/sanitize-html.decorator';

export class CreateAppointmentDto {
  @IsInt()
  @IsNotEmpty()
  professionalId: number;

  @IsInt()
  @IsNotEmpty()
  serviceId: number;

  @IsString({ message: 'O nome deve ser um texto válido' })
  @IsNotEmpty({ message: 'Informe o nome do cliente' })
  @MaxLength(255, { message: 'O nome deve ter no máximo 255 caracteres' })
  @SanitizeHtml()
  customerName: string;

  @IsString({ message: 'O contato deve ser um texto válido' })
  @IsNotEmpty({ message: 'Informe o contato do cliente' })
  @MaxLength(255, { message: 'O contato deve ter no máximo 255 caracteres' })
  @SanitizeHtml()
  customerContact: string;

  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  @IsOptional()
  @IsString({ message: 'As observações devem ser um texto válido' })
  @MaxLength(1000, {
    message: 'As observações devem ter no máximo 1000 caracteres',
  })
  @SanitizeHtml()
  notes?: string;

  @IsOptional()
  @IsIn(['pending', 'confirmed', 'cancelled', 'completed'])
  status?: string;

  @IsOptional()
  @IsInt()
  tenantId?: number;
}