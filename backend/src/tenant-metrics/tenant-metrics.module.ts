import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from '../appointment/entities/appointment.entity';
import { Professional } from '../professional/entities/professional.entity';
import { Service } from '../service/entities/service.entity';
import { ServiceOption } from '../service/entities/service-option.entity';
import { TenantMetricsService } from './tenant-metrics.service';
import { TenantMetricsController } from './tenant-metrics.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, Professional, Service, ServiceOption]),
    AuthModule,
  ],
  controllers: [TenantMetricsController],
  providers: [TenantMetricsService],
})
export class TenantMetricsModule {}