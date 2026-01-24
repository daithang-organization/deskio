import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NextFunction, Request, Response } from 'express';
import 'reflect-metadata';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/http-exception.filter';
import { AppLogger } from './common/logger';
import { requestIdMiddleware } from './common/request-id.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    logger: new AppLogger('Bootstrap'),
  });

  // CORS - enable if needed for your microservices
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true,
  });

  // Correlation
  app.use((req: Request, res: Response, next: NextFunction) => requestIdMiddleware(req, res, next));

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Error standard
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global prefix for API versioning (optional)
  app.setGlobalPrefix('api/v1');

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);

  const logger = new AppLogger('Bootstrap');
  logger.log(`Service listening on port ${port}`);
  logger.log(`Environment: ${process.env.NODE_ENV}`);
}

bootstrap();
