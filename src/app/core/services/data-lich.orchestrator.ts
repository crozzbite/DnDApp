import { Injectable, inject } from '@angular/core';
import {
  SearchCompendiumUseCase,
  SearchCompendiumQuery,
  SearchCompendiumResult,
} from '@core/use-cases/search-compendium.use-case';
import { GetResourceDetailUseCase } from '@core/use-cases/get-resource-detail.use-case';
import { IngestResourceUseCase } from '@core/use-cases/ingest-resource.use-case';
import { InitializeSessionUseCase } from '@core/use-cases/initialize-session.use-case';
import { CompendiumResource } from '@domain/models/resource.model';
import { UserSession } from '@domain/models/session.model';

/**
 * BRAIN — The Data Lich Orchestrator.
 *
 * Singleton inteligente que expone la API unificada de la Capa 2.
 * Gestiona la jerarquía de fuentes: Cache → Database → Vector.
 * Es el único punto de contacto entre la Capa 5 (Flesh/UI) y los Casos de Uso.
 *
 * Estrategia Stale-While-Revalidate (SWR):
 *   1. Sirve datos desde cache/estado inmediatamente si existen.
 *   2. Dispara actualización en segundo plano sin bloquear la UI.
 *
 * @spec brain-logic.spec.md § 5.2 "Orquestación Inteligente (Data Lich)"
 */
@Injectable({ providedIn: 'root' })
export class DataLichOrchestrator {
  // Use Cases — los "comandos" del Lich
  private readonly searchUseCase = inject(SearchCompendiumUseCase);
  private readonly detailUseCase = inject(GetResourceDetailUseCase);
  private readonly ingestUseCase = inject(IngestResourceUseCase);
  private readonly sessionUseCase = inject(InitializeSessionUseCase);

  // Cache local en memoria para Stale-While-Revalidate
  private readonly resourceCache = new Map<
    string,
    { data: CompendiumResource; ts: number }
  >();
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

  // ─── Búsqueda ────────────────────────────────────────────────────────────

  async search(query: SearchCompendiumQuery): Promise<SearchCompendiumResult> {
    return this.searchUseCase.execute(query);
  }

  // ─── Detalle de Recurso (con SWR) ────────────────────────────────────────

  async getResource(index: string): Promise<CompendiumResource> {
    const cached = this.resourceCache.get(index);
    const now = Date.now();

    if (cached && now - cached.ts < this.CACHE_TTL_MS) {
      // STALE: Devolver en caché y revalidar en background
      this.revalidateInBackground(index);
      return cached.data;
    }

    // MISS: Fetch fresco y guardar en cache
    const resource = await this.detailUseCase.execute({ index });
    this.resourceCache.set(index, { data: resource, ts: now });
    return resource;
  }

  // ─── Ingestión ───────────────────────────────────────────────────────────

  async ingest(resource: CompendiumResource): Promise<void> {
    return this.ingestUseCase.execute({ resource });
  }

  // ─── Sesiones ────────────────────────────────────────────────────────────

  async initSession(existingSessionId?: string): Promise<UserSession> {
    return this.sessionUseCase.execute(existingSessionId);
  }

  // ─── Privados ────────────────────────────────────────────────────────────

  /**
   * Revalida el recurso en segundo plano sin bloquear la respuesta al usuario.
   */
  private revalidateInBackground(index: string): void {
    this.detailUseCase
      .execute({ index })
      .then((fresh) => {
        this.resourceCache.set(index, { data: fresh, ts: Date.now() });
      })
      .catch(() => {
        // Silencioso: no interrumpir la UX por un fallo de revalidación
      });
  }
}
