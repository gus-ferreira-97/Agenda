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
import { APP_INTERCEPTOR, APP_GUARD, APP_FILTER } from '@nestjs/core';
import { AuditLogModule } from './audit-log/audit-log.module';
import { AuditInterceptor } from './audit-log/audit.interceptor';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { HealthController } from './health.controller';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { SentryModule } from '@sentry/nestjs/setup';
import { SentryGlobalFilter } from '@sentry/nestjs/setup';
import { TurnstileModule } from './common/turnstile/turnstile.module';


@Module({
  imports: [
    SentryModule.forRoot(),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get<string>('NODE_ENV') === 'production';

        return {
          pinoHttp: {
            transport: !isProduction
              ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  singleLine: true,
                  translateTime: 'HH:MM:ss',
                  ignore: 'pid,hostname',
                },
              }
              : undefined,
            level: isProduction ? 'info' : 'debug',
            redact: {
              paths: [
                'req.headers.authorization',
                'req.headers.cookie',
                'req.body.password',
                'req.body.currentPassword',
                'req.body.newPassword',
                'req.body.password_hash',
                'req.body.reset_password_token',
                'req.body.email_verification_token',
                'res.headers["set-cookie"]',
              ],
              censor: '[REDACTED]',
            },
            autoLogging: {
              ignore: (req) => {
                const url = req.url || '';
                return (
                  url.includes('/public/plans') ||
                  url.includes('/public/tenant-info') ||
                  url.includes('/favicon') ||
                  url.includes('/robots.txt') ||
                  url.includes('/sitemap.xml')
                );
              },
            },
          },
        };
      },
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    TurnstileModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
        blockDuration: 60000,
      },
    ]),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        ssl:
          configService.get<string>('DB_SSL') === 'true'
            ? { rejectUnauthorized: false }
            : false,
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
  controllers: [HealthController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .exclude('public/register', 'public/verify-email', 'public/plans')
      .forRoutes({ path: 'public/*', method: RequestMethod.ALL });
  }
}