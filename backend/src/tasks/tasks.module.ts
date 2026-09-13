import { Module } from '@nestjs/common';
import { TrialCronService } from './trial-cron.service';
import { TenantModule } from '../tenant/tenant.module';

@Module({
  imports: [TenantModule],
  providers: [TrialCronService],
})
export class TasksModule {}