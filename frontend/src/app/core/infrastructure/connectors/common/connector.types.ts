import { Observable } from 'rxjs';
import { CompendiumResource } from '@domain/models/resource.model';

/**
 * ARMOR — Tipos compartidos para la capa de infraestructura/conectores.
 */

/**
 * Representa la estructura básica de un error de red o de API.
 */
/**
 * ARMOR — Categorización de fallos en infraestructura.
 */
export enum ConnectorErrorCode {
  NETWORK_TIMEOUT = 'NETWORK_TIMEOUT',
  RATE_LIMIT = 'RATE_LIMIT',
  UNAUTHORIZED = 'UNAUTHORIZED',
  NOT_FOUND = 'NOT_FOUND',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Representa la estructura básica de un error de red o de API.
 */
export interface ConnectorErrorPayload {
  message?: string;
  status?: number;
  code?: string;
  details?: unknown;
  [key: string]: unknown;
}

/**
 * Tipado para metadatos de conectores.
 */
export interface ConnectorMetadata {
  source: string;
  timestamp: string;
}

/**
 * ARMOR — Estandarización de errores en la capa de conectores.
 */
export class ConnectorError extends Error {
  public code: ConnectorErrorCode;
  public timestamp: string;

  constructor(
    public override message: string,
    public status: number,
    public source: string,
    public isRetryable: boolean = false,
    public rawError?: unknown,
  ) {
    super(message);
    this.name = 'ConnectorError';
    this.code = this.mapStatusToCode(status);
    this.timestamp = new Date().toISOString();
  }

  /**
   * Mapea un error HTTP a la estructura de ConnectorError.
   * Especialmente diseñado para HttpErrorResponse de Angular.
   */
  static fromHttpError(error: unknown, source: string): ConnectorError {
    const err = error as ConnectorErrorPayload;
    const status = err?.status || 500;
    const isRetryable = status === 429 || status >= 500;

    // Extraemos el mensaje (remoteMessage). El error puede estar anidado
    // según cómo sea la respuesta del servidor (Angular HttpErrorResponse)
    const errorBody = err['error'] as ConnectorErrorPayload;
    const remoteMessage =
      errorBody?.message || err?.message || `Error en conector: ${source}`;

    return new ConnectorError(
      remoteMessage,
      status,
      source,
      isRetryable,
      error,
    );
  }

  private mapStatusToCode(status: number): ConnectorErrorCode {
    if (status === 0) return ConnectorErrorCode.NETWORK_TIMEOUT;
    if (status === 401 || status === 403)
      return ConnectorErrorCode.UNAUTHORIZED;
    if (status === 404) return ConnectorErrorCode.NOT_FOUND;
    if (status === 429) return ConnectorErrorCode.RATE_LIMIT;
    if (status >= 500) return ConnectorErrorCode.SERVER_ERROR;
    return ConnectorErrorCode.UNKNOWN;
  }

  /**
   * Genera un log estructurado (Lich-style) para telemetría.
   */
  toLog(): Record<string, unknown> {
    return {
      severity: 'ERROR',
      source: this.source,
      code: this.code,
      status: this.status,
      message: this.message,
      timestamp: this.timestamp,
      isRetryable: this.isRetryable,
    };
  }
}

/**
 * ARMOR — Abstracción de Oráculo para el Compendio.
 * Define el contrato que cualquier conector SRD o externo debe cumplir.
 */
export interface CompendiumOracle {
  getMonster(index: string): Observable<CompendiumResource>;
  getSpell(index: string): Observable<CompendiumResource>;
}
