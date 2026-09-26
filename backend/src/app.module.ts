import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR, APP_GUARD, APP_FILTER } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import { SentryModule } from '@sentry/nestjs/setup';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { AvailabilityModule } from './common/availability/availability.module';

// Feature modules
import { AuthModule } from './auth/auth.module';
import { TenantModule } from './tenant/tenant.module';
import { Tenant } from './tenant/entities/tenant.entity';
import { UserModule } from './user/user.module';
import { ProfessionalModule } from './professional/professional.module';
import { ServiceModule } from './service/service.module';
import { ServiceOptionModule } from './service-option/service-option.module';
import { ProfessionalServiceModule } from './professional-service/professional-service.module';
import { AppointmentModule } from './appointment/appointment.module';
import { WorkScheduleModule } from './work-schedule/work-schedule.module';
import { PublicModule } from './public/public.module';
import { MailModule } from './mail/mail.module';
import { SuperAdminModule } from './super-admin/super-admin.module';
import { TenantMetricsModule } from './tenant-metrics/tenant-metrics.module';
import { TasksModule } from './tasks/tasks.module';
import { AuditLogModule } from './audit-log/audit-log.module';

// Guards, filters, interceptors
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TenantThrottlerGuard } from './common/guards/tenant-throttler.guard';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { AuditInterceptor } from './audit-log/audit.interceptor';

// Middlewares
import { TenantMiddleware } from './common/middlewares/tenant.middleware';

// Módulos comuns
import { TurnstileModule } from './common/turnstile/turnstile.module';

// Controllers
import { HealthController } from './health.controller';

@Module({
  imports: [
    SentryModule.forRoot(),

    // ============ Configuração ============
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProduction =
          configService.get<string>('NODE_ENV') === 'production';

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

    // ============ Segurança ============
    TurnstileModule,
    AvailabilityModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
        blockDuration: 60000,
      },
    ]),

    // ============ Agendamento ============
    ScheduleModule.forRoot(),

    // ============ Banco de dados ============
    TypeOrmModule.forRootAsync({
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
        autoLoadEntities: true,
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    // Necessário para o TenantMiddleware (registrado no AppModule)
    // ter acesso ao repositório Tenant via @InjectRepository
    TypeOrmModule.forFeature([Tenant]),

    // ============ Feature modules ============
    TenantModule,
    UserModule,
    AuthModule,
    ProfessionalModule,
    ServiceModule,
    ServiceOptionModule,
    ProfessionalServiceModule,
    AppointmentModule,
    WorkScheduleModule,
    PublicModule,
    MailModule,
    SuperAdminModule,
    TenantMetricsModule,
    TasksModule,
    AuditLogModule,
  ],
  controllers: [HealthController],
  providers: [
    // Ordem importa: filtros são executados na ordem de registro
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    // Ordem dos guards: rate limit → auth → roles
    {
      provide: APP_GUARD,
      useClass: TenantThrottlerGuard,
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