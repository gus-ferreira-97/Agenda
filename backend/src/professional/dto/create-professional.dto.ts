import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt } from 'class-validator';

export class CreateProfessionalDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  specialty: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  // Opcional: se informado, associa a um tenant específico (apenas super admin pode usar)
  @IsOptional()
  @IsInt()
  tenantId?: number;
}