import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { getAllowedOrigins, getCorsOriginDelegate } from './common/config/runtime-config';

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

  // Socket.io adapter (must be before listen)
  app.useWebSocketAdapter(new IoAdapter(app));

  // CORS — allow the React frontend and HTML portals to call the API
  app.enableCors({
    origin: getCorsOriginDelegate(),
    credentials: true,
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`SMISSI API running on port ${port}`);
  console.log(`Allowed CORS origins: ${getAllowedOrigins().join(', ')}`);
}
bootstrap();
