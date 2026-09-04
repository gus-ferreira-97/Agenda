import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  IsBoolean,
  IsNumber,
} from 'class-validator';

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
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