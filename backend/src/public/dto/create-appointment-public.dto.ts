import { IsString, IsNotEmpty, IsInt, IsOptional, IsDateString } from 'class-validator';
import { SanitizeHtml } from '../../common/validators/sanitize-html.decorator';

export class CreateAppointmentPublicDto {
  @IsInt()
  professionalId: number;

  @IsInt()
  serviceId: number;

  @IsOptional()
  @IsInt({ message: 'A variação do serviço é inválida' })
  serviceOptionId?: number;

  @IsString()
  @IsNotEmpty()
  @SanitizeHtml()
  customerName: string;

  @IsString()
  @IsNotEmpty()
  @SanitizeHtml()
  customerContact: string;

  @IsDateString()
  startTime: string;

  @IsOptional()
  @IsString()
  @SanitizeHtml()
  notes?: string;

  @IsOptional()
  @IsString()
  _hp?: string;
}