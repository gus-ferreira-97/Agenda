import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from '../appointment/entities/appointment.entity';
import { Tenant } from '../tenant/entities/tenant.entity';
import { Professional } from '../professional/entities/professional.entity';
import { Service } from '../service/entities/service.entity';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, Tenant, Professional, Service]),
    AuthModule,
  ],
  controllers: [MetricsController],
  providers: [MetricsService],
})
export class SuperAdminModule {}