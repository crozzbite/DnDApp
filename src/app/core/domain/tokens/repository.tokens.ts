import { InjectionToken } from '@angular/core';
import { ICompendiumRepository } from '../repositories/compendium.repository.interface';
import { IVectorOracle } from '../repositories/vector-oracle.interface';
import { ISessionRepository } from '../repositories/session.repository.interface';

/**
 * Tokens de Inyección de Dependencias para los contratos del dominio.
 * Permiten usar interfaces como tokens en el sistema DI de Angular.
 *
 * Uso en providers:
 *   { provide: COMPENDIUM_REPO_TOKEN, useClass: MiImplementacionConcreta }
 *
 * Uso en servicios/use-cases:
 *   inject<ICompendiumRepository>(COMPENDIUM_REPO_TOKEN)
 */
export const COMPENDIUM_REPO_TOKEN = new InjectionToken<ICompendiumRepository>(
  'ICompendiumRepository',
);

export const VECTOR_ORACLE_TOKEN = new InjectionToken<IVectorOracle>(
  'IVectorOracle',
);

export const SESSION_REPO_TOKEN = new InjectionToken<ISessionRepository>(
  'ISessionRepository',
);
