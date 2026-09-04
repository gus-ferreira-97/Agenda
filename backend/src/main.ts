import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // remove campos não especificados no DTO
    forbidNonWhitelisted: true, // retorna erro se houver campos extras
    transform: true, // transforma payloads para instâncias do DTO
  }));
  await app.listen(3000);
}
bootstrap();