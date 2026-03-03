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
import { Open5eMonsterResponse, Open5eSpellResponse } from './open5e.types';
import { Open5eNormalizer } from './open5e.normalizer';

/**
 * ARMOR — Oracle Conector para api.open5e.com
 * Ahora heredando de BaseOracleConnector para mayor resiliencia y caché consistente.
 */
@Injectable({ providedIn: 'root' })
export class Open5eConnector extends BaseOracleConnector {
  protected readonly baseUrl = environment.open5eApiUrl;
  protected readonly sourceName = 'Open5e';

  constructor() {
    super(inject(HttpClient));
  }

  /**
   * Busca un monstruo por su slug único.
   */
  getMonster(slug: string): Observable<CompendiumResource> {
    if (!slug?.trim()) {
      return throwError(() => new Error('Slug inválido para Open5e:Monster'));
    }

    return this.fetchWithCache<Open5eMonsterResponse>(
      `monster:${slug}`,
      `monsters/${slug}/`,
      Open5eNormalizer.toResourceFromMonster,
    );
  }

  /**
   * Busca un hechizo por su slug único.
   */
  getSpell(slug: string): Observable<CompendiumResource> {
    if (!slug?.trim()) {
      return throwError(() => new Error('Slug inválido para Open5e:Spell'));
    }

    return this.fetchWithCache<Open5eSpellResponse>(
      `spell:${slug}`,
      `spells/${slug}/`,
      Open5eNormalizer.toResourceFromSpell,
    );
  }
}
