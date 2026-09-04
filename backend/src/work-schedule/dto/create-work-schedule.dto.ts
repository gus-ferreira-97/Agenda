import { IsInt, IsNotEmpty, IsOptional, Matches, Min, Max } from 'class-validator';

export class CreateWorkScheduleDto {
  @IsInt()
  @IsNotEmpty()
  professionalId: number;

  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'startTime deve estar no formato HH:mm' })
  startTime: string;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'endTime deve estar no formato HH:mm' })
  endTime: string;

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'breakStart deve estar no formato HH:mm' })
  breakStart?: string;

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'breakEnd deve estar no formato HH:mm' })
  breakEnd?: string;

  @IsOptional()
  @IsInt()
  tenantId?: number; // opcional, para super admin
}