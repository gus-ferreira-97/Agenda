import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from './entities/service.entity';
import { ServiceService } from './service.service';
import { ServiceController } from './service.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Service]),
    AuthModule,
  ],
  controllers: [ServiceController],
  providers: [ServiceService],
})
export class ServiceModule {}