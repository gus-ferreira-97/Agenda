import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantModule } from './tenant/tenant.module';
import { Tenant } from './tenant/entities/tenant.entity';
import { TenantConfig } from './tenant/entities/tenant-config.entity';
import { User } from './user/entities/user.entity';
import { Professional } from './professional/entities/professional.entity';
import { WorkSchedule } from './professional/entities/work-schedule.entity';
import { Service } from './service/entities/service.entity';
import { ProfessionalService } from './service/entities/professional-service.entity';
import { Appointment } from './appointment/entities/appointment.entity';
import { AuditLog } from './audit-log/entities/audit-log.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [
          Tenant,
          TenantConfig,
          User,
          Professional,
          WorkSchedule,
          Service,
          ProfessionalService,
          Appointment,
          AuditLog,
        ],
        autoLoadEntities: true,
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    TenantModule,
  ],
})
export class AppModule { }