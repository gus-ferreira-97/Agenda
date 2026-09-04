import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsDateString,
  IsIn,
} from 'class-validator';

export class CreateAppointmentDto {
  @IsInt()
  @IsNotEmpty()
  professionalId: number;

  @IsInt()
  @IsNotEmpty()
  serviceId: number;

  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsString()
  @IsNotEmpty()
  customerContact: string;

  // Data e hora de início no formato ISO 8601 (ex.: "2026-09-04T14:00:00Z" ou "2026-09-04T11:00:00-03:00")
  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsIn(['pending', 'confirmed', 'cancelled', 'completed'])
  status?: string;

  // Opcional para super admin; para tenant_admin será obtido do token
  @IsOptional()
  @IsInt()
  tenantId?: number;
}