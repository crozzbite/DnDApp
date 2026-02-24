import { CompendiumResource } from '../models/resource.model';

/**
 * Contrato del "Alquimista" para transformar datos crudos en Huesos.
 */
export interface IResourceNormalizer {
  toBones(rawData: unknown, category: string): CompendiumResource;
}
