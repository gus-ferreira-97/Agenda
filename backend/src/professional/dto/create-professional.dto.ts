import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt } from 'class-validator';
import { SanitizeHtml } from '../../common/validators/sanitize-html.decorator';

export class CreateProfessionalDto {
  @IsString()
  @IsNotEmpty()
  @SanitizeHtml()
  name: string;

  @IsString()
  @IsNotEmpty()
  @SanitizeHtml()
  specialty: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  // Opcional: se informado, associa a um tenant específico (apenas super admin pode usar)
  @IsOptional()
  @IsInt()
  tenantId?: number;
}