import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';
import { Professional } from '../professional/entities/professional.entity';
import { Service } from '../service/entities/service.entity';
import { ServiceOption } from '../service/entities/service-option.entity';
import { WorkSchedule } from '../professional/entities/work-schedule.entity';
import { TenantConfig } from '../tenant/entities/tenant-config.entity';
import { Appointment } from '../appointment/entities/appointment.entity';
import { Tenant } from '../tenant/entities/tenant.entity';
import { User } from '../user/entities/user.entity';
import { ProfessionalService } from '../service/entities/professional-service.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Professional,
      Service,
      ServiceOption,
      WorkSchedule,
      TenantConfig,
      Appointment,
      Tenant,
      User,
      ProfessionalService,
    ]),
  ],
  controllers: [PublicController],
  providers: [PublicService],
})
export class PublicModule {}