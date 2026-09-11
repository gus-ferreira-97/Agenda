import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Professional } from './entities/professional.entity';
import { Appointment } from '../appointment/entities/appointment.entity';
import { ProfessionalService } from './professional.service';
import { ProfessionalController } from './professional.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Professional, Appointment]),
    AuthModule,
  ],
  controllers: [ProfessionalController],
  providers: [ProfessionalService],
})
export class ProfessionalModule {}