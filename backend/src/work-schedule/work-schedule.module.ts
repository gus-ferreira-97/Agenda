import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkSchedule } from '../professional/entities/work-schedule.entity';
import { Professional } from '../professional/entities/professional.entity';
import { WorkScheduleService } from './work-schedule.service';
import { WorkScheduleController } from './work-schedule.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkSchedule, Professional]),
    AuthModule,
  ],
  controllers: [WorkScheduleController],
  providers: [WorkScheduleService],
})
export class WorkScheduleModule {}