import { IsString, IsNotEmpty, IsInt, IsOptional, IsDateString } from 'class-validator';

export class CreateAppointmentPublicDto {
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
  startTime: string;

  @IsOptional()
  @IsString()
  notes?: string;
}