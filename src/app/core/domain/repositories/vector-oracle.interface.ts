import { CompendiumResource } from '../models/resource.model';

/**
 * Contrato para la búsqueda semántica (Vector Nexus).
 */
export interface IVectorOracle {
  findSemanticMatches(query: string, topK: number): Promise<string[]>; // Retorna IDs
  indexResource(resource: CompendiumResource): Promise<void>;
}
