import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { SanitizeHtml } from '../../common/validators/sanitize-html.decorator';

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  @SanitizeHtml()
  name: string;

  @IsOptional()
  @IsString()
  @SanitizeHtml()
  description?: string;

  @IsInt()
  @Min(1)
  durationMinutes: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  price?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  // Obrigatório apenas para super admin; para tenant_admin o tenant vem do token
  @IsOptional()
  @IsInt()
  tenantId?: number;
}