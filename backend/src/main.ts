import './instrument';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';

/**
 * Configura o CORS com verificação dinâmica de origens.
 * Aceita:
 *  - Lista explícita do .env (CORS_ORIGINS)
 *  - Domínio base + subdomínios (BASE_DOMAIN)
 *  - localhost, *.localhost, *.agendyapp.local (dev)
 */
function buildCorsOptions(configService: ConfigService) {
  const allowedOrigins = (configService.get<string>('CORS_ORIGINS') || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  const baseDomain = configService.get<string>('BASE_DOMAIN') || '';

  return {
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Permite requisições sem origin (Postman, curl, health checks)
      if (!origin) return callback(null, true);

      // Lista explícita do .env
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      try {
        const { hostname } = new URL(origin);

        // Produção: domínio base + subdomínios
        if (baseDomain) {
          if (hostname === baseDomain || hostname.endsWith(`.${baseDomain}`)) {
            return callback(null, true);
          }
        }

        // Desenvolvimento
        if (
          hostname === 'localhost' ||
          hostname.endsWith('.agendyapp.local') ||
          hostname.endsWith('.localhost')
        ) {
          return callback(null, true);
        }
      } catch {
        // Ignora erros de parse
      }

      return callback(new Error('Origem não permitida pelo CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });
  app.useLogger(app.get(Logger));

  // Limita o tamanho do body das requisições
  app.use(json({ limit: '100kb' }));
  app.use(urlencoded({ limit: '100kb', extended: true }));

  const configService = app.get(ConfigService);

  // Confia no primeiro proxy (Nginx/Caddy) para ler X-Forwarded-For
  app.set('trust proxy', 1);

  // ============ CORS ============
  app.enableCors(buildCorsOptions(configService));

  // ============ Helmet ============
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // ============ Pipes ============
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
}

bootstrap();