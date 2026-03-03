import { CompendiumResource } from '../models/resource.model';

/**
 * Filtros de búsqueda para el compendio.
 */
export interface SearchFilters {
  category?: string;
  source?: string;
  level?: number;
  challengeRating?: number;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Contrato para la persistencia del conocimiento (SQL Tome).
 */
export interface ICompendiumRepository {
  findByIndex(index: string): Promise<CompendiumResource | null>;
  findManyByCategory(
    category: string,
    limit?: number,
  ): Promise<CompendiumResource[]>;
  search(query: string, filters: SearchFilters): Promise<CompendiumResource[]>;
  save(resource: CompendiumResource): Promise<void>;
  bulkSave(resources: CompendiumResource[]): Promise<void>;
}
