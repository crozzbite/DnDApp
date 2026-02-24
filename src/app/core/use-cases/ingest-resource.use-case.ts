import { Injectable, inject } from '@angular/core';
import { ICompendiumRepository } from '@domain/repositories/compendium.repository.interface';
import { IVectorOracle } from '@domain/repositories/vector-oracle.interface';
import { CompendiumResource } from '@domain/models/resource.model';
import {
  COMPENDIUM_REPO_TOKEN,
  VECTOR_ORACLE_TOKEN,
} from '@domain/tokens/repository.tokens';

export interface IngestResourceCommand {
  resource: CompendiumResource;
}

/**
 * BRAIN — Caso de uso para ingestar un recurso en el Compendio.
 * Persiste en el SQL Tome y lo indexa en el Vector Nexus (Pinecone).
 *
 * @spec brain-logic.spec.md § 5.1
 */
@Injectable({ providedIn: 'root' })
export class IngestResourceUseCase {
  private readonly compendiumRepo = inject<ICompendiumRepository>(
    COMPENDIUM_REPO_TOKEN,
  );
  private readonly vectorOracle = inject<IVectorOracle>(VECTOR_ORACLE_TOKEN);

  async execute(command: IngestResourceCommand): Promise<void> {
    const { resource } = command;
    // Paso 1: Persistir en el repositorio estructurado (SQL Tome)
    await this.compendiumRepo.save(resource);
    // Paso 2: Indexar en el Vector Nexus para búsqueda semántica
    await this.vectorOracle.indexResource(resource);
  }
}
