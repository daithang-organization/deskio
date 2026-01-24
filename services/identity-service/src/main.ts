import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NextFunction, Request, Response } from 'express';
import 'reflect-metadata';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/http-exception.filter';
import { requestIdMiddleware } from './common/request-id.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Correlation
  app.use((req: Request, res: Response, next: NextFunction) => requestIdMiddleware(req, res, next));

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidUnknownValues: true,
      transform: true,
    }),
  );

  // Error standard
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`Service listening on port ${port}`);
}

bootstrap();
