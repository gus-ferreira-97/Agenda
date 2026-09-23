import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrialCronService } from './trial-cron.service';
import { LogRetentionService } from './log-retention.service';
import { TenantModule } from '../tenant/tenant.module';
import { AuditLog } from '../audit-log/entities/audit-log.entity';

@Module({
  imports: [
    TenantModule,
    TypeOrmModule.forFeature([AuditLog]),
  ],
  providers: [TrialCronService, LogRetentionService],
})
export class TasksModule {}