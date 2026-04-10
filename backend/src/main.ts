import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix — all API routes are at /api/*
  app.setGlobalPrefix('api');

  // Validate and strip unknown fields from all incoming DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,       // strip unknown fields
      forbidNonWhitelisted: true,
      transform: true,       // auto-transform payloads to DTO class instances
    }),
  );

  // CORS — allow the HTML portals served at /portals/* to call the API
  app.enableCors({
    origin: true,
    credentials: true,
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`SMISSI API running on http://localhost:${port}/api`);
}
bootstrap();
