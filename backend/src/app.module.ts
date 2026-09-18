import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantModule } from './tenant/tenant.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { Tenant } from './tenant/entities/tenant.entity';
import { TenantConfig } from './tenant/entities/tenant-config.entity';
import { User } from './user/entities/user.entity';
import { Professional } from './professional/entities/professional.entity';
import { WorkSchedule } from './professional/entities/work-schedule.entity';
import { Service } from './service/entities/service.entity';
import { ProfessionalService } from './service/entities/professional-service.entity';
import { Appointment } from './appointment/entities/appointment.entity';
import { AuditLog } from './audit-log/entities/audit-log.entity';
import { ProfessionalModule } from './professional/professional.module';
import { ServiceModule } from './service/service.module';
import { ProfessionalServiceModule } from './professional-service/professional-service.module';
import { AppointmentModule } from './appointment/appointment.module';
import { WorkScheduleModule } from './work-schedule/work-schedule.module';
import { PublicModule } from './public/public.module';
import { TenantMiddleware } from './common/middlewares/tenant.middleware';
import { MailModule } from './mail/mail.module';
import { SuperAdminModule } from './super-admin/super-admin.module';
import { TenantMetricsModule } from './tenant-metrics/tenant-metrics.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksModule } from './tasks/tasks.module';
import { ServiceOption } from './service/entities/service-option.entity';
import { ServiceOptionModule } from './service-option/service-option.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditLogModule } from './audit-log/audit-log.module';
import { AuditInterceptor } from './audit-log/audit.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [
        ConfigModule,
        ProfessionalModule,
        ServiceModule,
        ProfessionalServiceModule,
        AppointmentModule,
        WorkScheduleModule,
        PublicModule,
        MailModule,
        SuperAdminModule,
        TenantMetricsModule,
        TasksModule,
        ServiceOptionModule,
        AuditLogModule,
      ],

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
          ServiceOption,
          ProfessionalService,
          Appointment,
          AuditLog,
        ],
        autoLoadEntities: true,
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Tenant]),
    TenantModule,
    UserModule,
    AuthModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .exclude('public/register', 'public/verify-email', 'public/plans')
      .forRoutes({ path: 'public/*', method: RequestMethod.ALL });
  }
}