import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

type ErrorBody = {
  error: { code: string; message: string; details?: unknown };
  meta: { requestId?: string };
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const requestId = (req as any).requestId;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message = 'Unexpected error';
    let details: unknown = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse();

      // Nest can return string | object
      if (typeof response === 'string') {
        message = response;
      } else if (typeof response === 'object' && response !== null) {
        // Common shape: { message, error, statusCode }
        const anyRes = response as any;
        message = Array.isArray(anyRes.message) ? 'Validation error' : (anyRes.message ?? message);
        details = anyRes;

        // Map some common cases into stable codes
        if (status === HttpStatus.BAD_REQUEST && Array.isArray(anyRes.message)) {
          code = 'VALIDATION_ERROR';
          details = { fields: anyRes.message };
        } else if (status === HttpStatus.UNAUTHORIZED) {
          code = 'UNAUTHENTICATED';
        } else if (status === HttpStatus.FORBIDDEN) {
          code = 'FORBIDDEN';
        } else if (status === HttpStatus.NOT_FOUND) {
          code = 'NOT_FOUND';
        } else {
          code = `HTTP_${status}`;
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      details = { name: exception.name };
    }

    const body: ErrorBody = {
      error: { code, message, details },
      meta: { requestId },
    };

    // Log with correlation
    this.logger.error(
      JSON.stringify({
        requestId,
        status,
        code,
        message,
        path: req.originalUrl,
        method: req.method,
      }),
      exception instanceof Error ? exception.stack : undefined,
    );

    res.status(status).json(body);
  }
}
