import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import {
  Observable,
  timer,
  throwError,
  map,
  catchError,
  retry,
  shareReplay,
} from 'rxjs';
import { CompendiumResource } from '@domain/models/resource.model';
import { CompendiumOracle, ConnectorError } from './connector.types';

/**
 * BONES — Clase abstracta base para Oráculos de Datos.
 * Implementa Sliding TTL, Backoff Exponencial y Soporte para Headers de Seguridad.
 */
export abstract class BaseOracleConnector implements CompendiumOracle {
  protected abstract readonly baseUrl: string;
  protected abstract readonly sourceName: string;

  protected readonly TTL_MS = 5 * 60 * 1000;

  protected readonly cache = new Map<
    string,
    { stream: Observable<CompendiumResource>; timestamp: number }
  >();

  constructor(protected readonly http: HttpClient) {}

  abstract getMonster(index: string): Observable<CompendiumResource>;
  abstract getSpell(index: string): Observable<CompendiumResource>;

  /**
   * Hook para inyectar headers de seguridad (HMAC, API Keys, etc) en clases hijas.
   */
  protected getHeaders(): HttpHeaders | undefined {
    return undefined;
  }

  /**
   * Orquestador de peticiones con Sliding TTL y Limpieza de URL.
   */
  protected fetchWithCache<T>(
    cacheId: string,
    endpoint: string,
    normalizer: (resp: T) => CompendiumResource,
  ): Observable<CompendiumResource> {
    const cacheKey = `${this.sourceName}:${cacheId}`;
    const cached = this.cache.get(cacheKey);

    // 🔥 Sliding TTL con Limpieza Explícita (Audit Tip)
    if (cached) {
      if (Date.now() - cached.timestamp < this.TTL_MS) {
        cached.timestamp = Date.now(); // Renovación
        return cached.stream;
      }
      this.cache.delete(cacheKey); // Pruning de expirados
    }

    // 🔥 Construcción de URL Robusta (No double slashes)
    const url = `${this.baseUrl.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

    const $resource = this.http
      .get<T>(url, { headers: this.getHeaders() })
      .pipe(
        retry({
          count: 2,
          delay: (error, retryCount) => this.backoffStrategy(error, retryCount),
        }),
        map(normalizer),
        catchError((error) => {
          this.cache.delete(cacheKey);
          return this.handleError(error, cacheKey);
        }),
        shareReplay({ bufferSize: 1, refCount: true }),
      );

    this.cache.set(cacheKey, { stream: $resource, timestamp: Date.now() });
    return $resource;
  }

  protected backoffStrategy(
    error: HttpErrorResponse,
    retryCount: number,
  ): Observable<unknown> {
    const status = error.status;
    if (status === 0 || status === 429 || status >= 500) {
      const waitTime = Math.pow(2, retryCount - 1) * 1000;
      return timer(waitTime);
    }
    return throwError(() => error);
  }

  protected handleError(error: unknown, context: string): Observable<never> {
    const connectorError = ConnectorError.fromHttpError(error, context);
    return throwError(() => connectorError);
  }
}
