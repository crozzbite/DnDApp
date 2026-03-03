import { Injectable, inject } from '@angular/core';
import { ISessionRepository } from '@domain/repositories/session.repository.interface';
import { UserSession } from '@domain/models/session.model';
import { SESSION_REPO_TOKEN } from '@domain/tokens/repository.tokens';

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * BRAIN — Caso de uso para inicializar una sesión de usuario (Shadow Session).
 * Crea una nueva sesión anónima o recupera la existente desde el Cache Mantle.
 *
 * @spec brain-logic.spec.md § 5.1
 */
@Injectable({ providedIn: 'root' })
export class InitializeSessionUseCase {
  private readonly sessionRepo = inject<ISessionRepository>(SESSION_REPO_TOKEN);

  async execute(existingSessionId?: string): Promise<UserSession> {
    if (existingSessionId) {
      const existing = await this.sessionRepo.getSession(existingSessionId);
      if (existing) {
        return existing;
      }
    }

    const now = Date.now();
    const newSession: UserSession = {
      id: generateSessionId(),
      createdAt: now,
      updatedAt: now,
      history: [],
    };

    await this.sessionRepo.updateSession(newSession.id, newSession);
    return newSession;
  }
}
