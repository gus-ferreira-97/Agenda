import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as Sentry from '@sentry/nestjs';
import { AuditLogService } from '../../audit-log/audit-log.service';

/** Rotas cujo 401/403 NÃO é auditado (evita poluir com tentativas anônimas) */
const AUDIT_EXCLUDED_PATHS = ['/auth/', '/public/', '/health'];

/** Mapeamento de segmento de URL → nome da entidade para o audit */
const ENTITY_MAP: Record<string, string> = {
  tenants: 'Tenant',
  users: 'User',
  professionals: 'Professional',
  services: 'Service',
  'service-options': 'ServiceOption',
  'work-schedules': 'WorkSchedule',
  'professional-services': 'ProfessionalService',
  appointments: 'Appointment',
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly auditLogService: AuditLogService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isProduction = process.env.NODE_ENV === 'production';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Erro interno do servidor';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const resp = exceptionResponse as any;
        message = resp.message ?? exception.message;
      }
    }

    // ============ AUDIT: registra tentativas negadas (401/403) ============
    if (status === 401 || status === 403) {
      this.recordDeniedAttempt(request);
    }

    // ============ Sentry: captura apenas erros 5xx ou não-HTTP ============
    const shouldReportToSentry =
      !(exception instanceof HttpException) || status >= 500;

    if (shouldReportToSentry) {
      Sentry.captureException(exception, {
        tags: { http_method: request.method },
        contexts: {
          request: {
            method: request.method,
            url: request.url,
            headers: {
              host: request.headers.host,
              'user-agent': request.headers['user-agent'],
            },
          },
        },
      });
    }

    // Loga internamente sempre (útil para debug no servidor)
    const errorMessage =
      exception instanceof Error ? exception.message : String(exception);
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${errorMessage}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    const body: any = {
      statusCode: status,
      message,
      error: HttpStatus[status] || 'Error',
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (!isProduction && exception instanceof Error) {
      body.stack = exception.stack;
    }

    response.status(status).json(body);
  }

  /**
   * Registra tentativas negadas em background.
   * Fire-and-forget: nunca bloqueia nem afeta a resposta HTTP.
   */
  private recordDeniedAttempt(request: Request): void {
    const url = request.originalUrl || request.url;

    // Ignora rotas que geram muito ruído
    if (AUDIT_EXCLUDED_PATHS.some((path) => url.includes(path))) {
      return;
    }

    const user = (request as any).user;
    const pathSegments = url.split('?')[0].split('/').filter(Boolean);
    const mainSegment = pathSegments[0];
    const entity = ENTITY_MAP[mainSegment] || mainSegment;
    const paramId = pathSegments[1] ? parseInt(pathSegments[1], 10) : null;

    const ipAddress =
      (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      request.ip ||
      null;
    const userAgent = request.headers['user-agent'] || null;

    this.auditLogService
      .log({
        userId: user?.userId ?? null,
        tenantId: user?.tenantId ?? null,
        action: 'denied',
        entity,
        entityId: paramId ?? 0,
        ipAddress,
        userAgent,
      })
      .catch((err) => {
        this.logger.error(
          `Falha ao registrar tentativa negada: ${(err as Error).message}`,
        );
      });
  }
}