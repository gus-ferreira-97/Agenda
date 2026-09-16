import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceOption } from '../service/entities/service-option.entity';
import { Service } from '../service/entities/service.entity';
import { Appointment } from '../appointment/entities/appointment.entity';
import { ServiceOptionService } from './service-option.service';
import { ServiceOptionController } from './service-option.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServiceOption, Service, Appointment]),
    AuthModule,
  ],
  controllers: [ServiceOptionController],
  providers: [ServiceOptionService],
})
export class ServiceOptionModule {}