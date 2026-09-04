import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfessionalService } from '../service/entities/professional-service.entity';
import { Professional } from '../professional/entities/professional.entity';
import { Service } from '../service/entities/service.entity';
import { ProfessionalServiceService } from './professional-service.service';
import { ProfessionalServiceController } from './professional-service.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProfessionalService, Professional, Service]),
    AuthModule,
  ],
  controllers: [ProfessionalServiceController],
  providers: [ProfessionalServiceService],
})
export class ProfessionalServiceModule {}