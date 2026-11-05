import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  // Activation de la validation automatique des DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Permettre les requêtes cross-origin depuis le Frontend Next.js
  app.enableCors({
    origin: process.env.FRONTEND_URL ,
    credentials: true,
  });

  await app.listen(process.env.PORT || 5000);
}
bootstrap();