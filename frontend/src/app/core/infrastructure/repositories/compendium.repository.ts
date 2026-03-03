import { Injectable, inject } from '@angular/core';
import {
  ICompendiumRepository,
  SearchFilters,
} from '@domain/repositories/compendium.repository.interface';
import { CompendiumResource } from '@domain/models/resource.model';
import { Dnd5eApiConnector } from '../connectors/dnd5e/dnd5e-api.connector';
import { Open5eConnector } from '../connectors/open5e/open5e.connector';
import { LocalDataAdapter } from '../connectors/static/local-data.adapter';
import { firstValueFrom } from 'rxjs';
import {
  ConnectorError,
  CompendiumOracle,
} from '../connectors/common/connector.types';

/**
 * ARMOR — Implementación centralizada del Repositorio del Compendio.
 * Actúa como un Orquestador (Dispatcher) que decide qué conector usar
 * según la fuente, categoría o estrategia de caché.
 */
@Injectable({ providedIn: 'root' })
export class CompendiumRepositoryImpl implements ICompendiumRepository {
  private readonly dnd5eConnector: CompendiumOracle = inject(Dnd5eApiConnector);
  private readonly open5eConnector: CompendiumOracle = inject(Open5eConnector);
  private readonly localDataAdapter: CompendiumOracle =
    inject(LocalDataAdapter);

  /**
   * Oráculos en orden de prioridad para el fallback.
   */
  private readonly oracles: CompendiumOracle[] = [
    this.dnd5eConnector,
    this.open5eConnector,
    this.localDataAdapter,
  ];

  /**
   * Busca un recurso por su índice único.
   */
  async findByIndex(index: string): Promise<CompendiumResource | null> {
    const listErrors: unknown[] = [];

    for (const oracle of this.oracles) {
      // Intentamos como monstruo
      try {
        const monster = await firstValueFrom(oracle.getMonster(index));
        if (monster) return monster;
      } catch (err) {
        listErrors.push(err);
      }

      // Intentamos como hechizo
      try {
        const spell = await firstValueFrom(oracle.getSpell(index));
        if (spell) return spell;
      } catch (err) {
        listErrors.push(err);
      }
    }

    // Si llegamos aquí, nada funcionó. Auditamos si hubo fallos críticos.
    this.auditFailures(index, listErrors);
    return null;
  }

  /**
   * Registra fallos críticos que no sean simples 'No Encontrado'.
   */
  private auditFailures(index: string, errors: unknown[]): void {
    const criticalErrors = errors.filter((e) => {
      const err = e as { status?: number };
      return err.status && err.status !== 404;
    });

    if (criticalErrors.length > 0) {
      console.warn(`💀 Skeleton Audit: Critical Failures resolving [${index}]`);
      criticalErrors.forEach((err) => {
        if (err instanceof ConnectorError) {
          console.error('[Connector Failure]', err.toLog());
        } else {
          console.error('[Raw Failure]', err);
        }
      });
    }
  }

  async findManyByCategory(
    category: string,
    limit?: number,
  ): Promise<CompendiumResource[]> {
    // TODO: Implementar cuando el Gateway de la Fase 3 esté expuesto
    return [];
  }

  async search(
    query: string,
    filters: SearchFilters,
  ): Promise<CompendiumResource[]> {
    // TODO: Conectar con el endpoint de búsqueda del backend (Fase 3.3)
    return [];
  }

  async save(resource: CompendiumResource): Promise<void> {
    // Los conectores de lectura (SRD) son read-only.
    // La escritura será vía Ingestion Gateway.
    console.warn('Escritura no implementada en el Repositorio de Lectura.');
  }

  async bulkSave(resources: CompendiumResource[]): Promise<void> {
    console.warn('Escritura masiva no implementada.');
  }
}
