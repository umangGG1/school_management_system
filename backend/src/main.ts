import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix — all API routes are at /api/*
  app.setGlobalPrefix('api');

  // Validate and strip unknown fields from all incoming DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Consistent error response shape
  app.useGlobalFilters(new AllExceptionsFilter());

  // Wrap all responses in { data, statusCode, timestamp }
  app.useGlobalInterceptors(new TransformInterceptor());

  // CORS — allow the React frontend and HTML portals to call the API
  app.enableCors({
    origin: true,
    credentials: true,
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`SMISSI API running on http://localhost:${port}/api`);
}
bootstrap();
