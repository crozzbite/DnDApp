import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface NexusResponse<T> {
  status: 'success';
  timestamp: string;
  data: T;
}

/**
 * NERVOUS SYSTEM — Transform Interceptor
 * Estandariza todas las respuestas del Nexo en un sobre "success".
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  NexusResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<NexusResponse<T>> {
    return next.handle().pipe(
      map((data: T) => ({
        status: 'success',
        timestamp: new Date().toISOString(),
        data,
      })),
    );
  }
}
