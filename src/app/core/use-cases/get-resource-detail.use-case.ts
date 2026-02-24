import { Injectable, inject } from '@angular/core';
import { ICompendiumRepository } from '@domain/repositories/compendium.repository.interface';
import { CompendiumResource } from '@domain/models/resource.model';
import { ResourceNotFoundException } from '@domain/exceptions/domain.exception';
import { COMPENDIUM_REPO_TOKEN } from '@domain/tokens/repository.tokens';

export interface GetResourceDetailQuery {
  index: string; // Slug único: "ancient-red-dragon"
}

/**
 * BRAIN — Caso de uso para obtener el detalle completo de un recurso.
 * Si no existe, lanza ResourceNotFoundException para que la UI la maneje.
 *
 * @spec brain-logic.spec.md § 5.1
 */
@Injectable({ providedIn: 'root' })
export class GetResourceDetailUseCase {
  private readonly compendiumRepo = inject<ICompendiumRepository>(
    COMPENDIUM_REPO_TOKEN,
  );

  async execute(query: GetResourceDetailQuery): Promise<CompendiumResource> {
    const resource = await this.compendiumRepo.findByIndex(query.index);

    if (!resource) {
      throw new ResourceNotFoundException(query.index);
    }

    return resource;
  }
}
