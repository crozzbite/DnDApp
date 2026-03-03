import { UserSession } from '../models/session.model';

/**
 * Contrato para la persistencia de sesiones (Cache Mantle).
 */
export interface ISessionRepository {
  getSession(sessionId: string): Promise<UserSession | null>;
  updateSession(sessionId: string, data: Partial<UserSession>): Promise<void>;
}
