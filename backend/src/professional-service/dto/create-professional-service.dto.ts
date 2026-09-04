import { IsInt, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateProfessionalServiceDto {
  @IsInt()
  @IsNotEmpty()
  professionalId: number;

  @IsInt()
  @IsNotEmpty()
  serviceId: number;

  // Opcional apenas para super admin; para tenant_admin será obtido do token
  @IsOptional()
  @IsInt()
  tenantId?: number;
}