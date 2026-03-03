import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  Observable,
  catchError,
  map,
  retry,
  shareReplay,
  throwError,
  timer,
} from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { CompendiumResource } from '@domain/models/resource.model';
import { BaseOracleConnector } from '../common/base-oracle.connector';
import { Dnd5eMonsterResponse, Dnd5eSpellResponse } from './dnd5e-api.types';
import { Dnd5eApiNormalizer } from './dnd5e-api.normalizer';

/**
 * ARMOR — Oracle Conector para dnd5eapi.co (SRD).
 * Ahora heredando de BaseOracleConnector para mayor resiliencia (Sliding TTL y Backoff).
 */
@Injectable({ providedIn: 'root' })
export class Dnd5eApiConnector extends BaseOracleConnector {
  protected readonly baseUrl = environment.dnd5eApiUrl;
  protected readonly sourceName = 'DnD5e';

  constructor() {
    super(inject(HttpClient));
  }

  /**
   * Obtiene un monstruo por su índice.
   */
  getMonster(index: string): Observable<CompendiumResource> {
    if (!index?.trim()) {
      return throwError(() => new Error('Index inválido para DnD5e:Monster'));
    }

    return this.fetchWithCache<Dnd5eMonsterResponse>(
      `monster:${index}`,
      `monsters/${index}`,
      Dnd5eApiNormalizer.toResourceFromMonster,
    );
  }

  /**
   * Obtiene un hechizo por su índice.
   */
  getSpell(index: string): Observable<CompendiumResource> {
    if (!index?.trim()) {
      return throwError(() => new Error('Index inválido para DnD5e:Spell'));
    }

    return this.fetchWithCache<Dnd5eSpellResponse>(
      `spell:${index}`,
      `spells/${index}`,
      Dnd5eApiNormalizer.toResourceFromSpell,
    );
  }
}
