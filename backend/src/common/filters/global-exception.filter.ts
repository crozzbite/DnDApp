import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

/**
 * NERVOUS SYSTEM — Global Exception Filter
 * Escudo de seguridad que centraliza el manejo de errores y protege el Nexo.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('NexusGuard');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal spectral error (The Nexus is unstable)';

    // Log estructurado para observabilidad
    this.logger.error({
      evt: 'SYSTEM_CRASH_PREVENTED',
      status,
      path: request.url,
      method: request.method,
      error: exception instanceof Error ? exception.message : 'Unknown spirit',
      stack: exception instanceof Error ? exception.stack : undefined,
    });

    response.status(status).send({
      status: 'error',
      timestamp: new Date().toISOString(),
      path: request.url,
      message: typeof message === 'string' ? message : (message as any).message,
      statusCode: status,
    });
  }
}
