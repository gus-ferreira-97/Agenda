import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Professional } from '../../professional/entities/professional.entity';
import { Service } from '../../service/entities/service.entity';
import { ServiceOption } from '../../service/entities/service-option.entity';
import { WorkSchedule } from '../../professional/entities/work-schedule.entity';
import { TenantConfig } from '../../tenant/entities/tenant-config.entity';
import { Appointment } from '../../appointment/entities/appointment.entity';
import { AvailabilityService } from './availability.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Professional,
      Service,
      ServiceOption,
      WorkSchedule,
      TenantConfig,
      Appointment,
    ]),
  ],
  providers: [AvailabilityService],
  exports: [AvailabilityService],
})
export class AvailabilityModule {}