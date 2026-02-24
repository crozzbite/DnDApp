import { Injectable, inject } from '@angular/core';
import {
  ICompendiumRepository,
  SearchFilters,
} from '@domain/repositories/compendium.repository.interface';
import { IVectorOracle } from '@domain/repositories/vector-oracle.interface';
import { CompendiumResource } from '@domain/models/resource.model';
import { PiiRedactionGuard } from '@core/use-cases/guards/pii-redaction.guard';
import {
  COMPENDIUM_REPO_TOKEN,
  VECTOR_ORACLE_TOKEN,
} from '@domain/tokens/repository.tokens';

export interface SearchCompendiumQuery {
  query: string;
  filters?: SearchFilters;
  topK?: number;
}

export interface SearchCompendiumResult {
  items: CompendiumResource[];
  total: number;
}

/**
 * BRAIN — Caso de uso para búsqueda en el Compendio.
 * Orquesta: PII Guard → Vector Oracle (semántica) → Compendium Repository (hidratación).
 *
 * @spec brain-logic.spec.md § 5.1 "SearchCompendium con Prioridad Semántica"
 */
@Injectable({ providedIn: 'root' })
export class SearchCompendiumUseCase {
  private readonly compendiumRepo = inject<ICompendiumRepository>(
    COMPENDIUM_REPO_TOKEN,
  );
  private readonly vectorOracle = inject<IVectorOracle>(VECTOR_ORACLE_TOKEN);

  async execute(query: SearchCompendiumQuery): Promise<SearchCompendiumResult> {
    // Guard: Sanear la query antes de enviarla al exterior
    const safeQuery = PiiRedactionGuard.sanitize(query.query);

    const filters: SearchFilters = query.filters ?? {};
    const topK = query.topK ?? 10;

    // Paso 1: Búsqueda semántica en el Vector Nexus (Pinecone)
    const semanticIds = await this.vectorOracle.findSemanticMatches(
      safeQuery,
      topK,
    );

    // Paso 2: Hidratación — recuperar datos completos desde el Compendium
    const hydratedItems: CompendiumResource[] = [];

    for (const id of semanticIds) {
      const resource = await this.compendiumRepo.findByIndex(id);
      if (resource) {
        hydratedItems.push(resource);
      }
    }

    // Paso 3: Complementar con búsqueda keyword si hay pocos resultados semánticos
    if (hydratedItems.length < topK) {
      const keywordResults = await this.compendiumRepo.search(
        safeQuery,
        filters,
      );
      for (const item of keywordResults) {
        if (!hydratedItems.some((h) => h.id === item.id)) {
          hydratedItems.push(item);
        }
      }
    }

    return {
      items: hydratedItems.slice(0, topK),
      total: hydratedItems.length,
    };
  }
}
