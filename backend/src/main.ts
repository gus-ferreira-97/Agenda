import './instrument';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as express from 'express';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });
  app.useLogger(app.get(Logger));

  // Limita o tamanho do body das requisições
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ limit: '100kb', extended: true }));

  const configService = app.get(ConfigService);

  // ============ CORS ============
  const corsOriginsEnv = configService.get<string>('CORS_ORIGINS') || '';
  const allowedOrigins = corsOriginsEnv
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  // Permite também qualquer subdomínio de agendyapp.com.br (produção)
  const baseDomain = 'agendyapp.com.br';

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Permite requisições sem origin (ex.: Postman, curl, health checks)
      if (!origin) return callback(null, true);

      // Lista explícita do .env
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      try {
        const url = new URL(origin);
        const hostname = url.hostname;

        // Produção: agendyapp.com.br e subdomínios
        if (hostname === baseDomain || hostname.endsWith(`.${baseDomain}`)) {
          return callback(null, true);
        }

        // Desenvolvimento: *.agendyapp.local e *.localhost
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
  });

  // ============ Helmet ============
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // ============ Pipes e Filtros ============
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.set('trust proxy', 1);

  await app.listen(3000);
}
bootstrap();