import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

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
        const response = exceptionResponse as any;
        message = response.message ?? exception.message;
      }
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