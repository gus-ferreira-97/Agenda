import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from './entities/tenant.entity';
import { Professional } from '../professional/entities/professional.entity';
import { Service } from '../service/entities/service.entity';
import { Appointment } from '../appointment/entities/appointment.entity';
import { AuditLog } from '../audit-log/entities/audit-log.entity';
import { WorkSchedule } from '../professional/entities/work-schedule.entity';
import { ProfessionalService } from '../service/entities/professional-service.entity';
import { User } from '../user/entities/user.entity';
import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tenant,
      Professional,
      Service,
      Appointment,
      AuditLog,
      WorkSchedule,
      ProfessionalService,
      User,
    ]),
  ],
  controllers: [TenantController],
  providers: [TenantService],
  exports: [TenantService],
})
export class TenantModule {}