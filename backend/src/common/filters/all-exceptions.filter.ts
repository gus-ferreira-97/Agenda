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

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

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

    // ============ Sentry: captura apenas erros 5xx ou não-HTTP ============
    // 4xx são erros esperados (validação, auth) — não poluem o painel
    const shouldReportToSentry =
      !(exception instanceof HttpException) || status >= 500;

    if (shouldReportToSentry) {
      Sentry.captureException(exception, {
        tags: {
          http_method: request.method,
        },
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

    // Em desenvolvimento, adiciona o stack trace para facilitar o debug
    if (!isProduction && exception instanceof Error) {
      body.stack = exception.stack;
    }

    response.status(status).json(body);
  }
}