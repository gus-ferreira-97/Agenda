import { IsString, IsNotEmpty, IsInt, IsOptional, IsDateString } from 'class-validator';

export class CreateAppointmentPublicDto {
  @IsInt()
  tenantId: number;

  @IsInt()
  professionalId: number;

  @IsInt()
  serviceId: number;

  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsString()
  @IsNotEmpty()
  customerContact: string;

  @IsDateString()
  startTime: string; // ISO 8601

  @IsOptional()
  @IsString()
  notes?: string;
}