import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, shareReplay, throwError } from 'rxjs';
import { CompendiumResource } from '@domain/models/resource.model';
import { ConnectorError, CompendiumOracle } from '../common/connector.types';
import { AschenbachCompendium } from './static-data.types';
import { StaticDataNormalizer } from './static-data.normalizer';

/**
 * ARMOR — LocalDataAdapter para JSONs estáticos (Nick Aschenbach).
 * Ideal como fuente secundaria de SRD o cuando no hay conexión.
 */
@Injectable({ providedIn: 'root' })
export class LocalDataAdapter implements CompendiumOracle {
  private readonly http = inject(HttpClient);
  private readonly localPath = 'assets/data/srd';

  // Caché de carga inicial del compendio completo
  private $compendium?: Observable<AschenbachCompendium>;

  /**
   * Carga el archivo completo de monstruos/hechizos.
   */
  private loadCompendium(): Observable<AschenbachCompendium> {
    if (this.$compendium) return this.$compendium;

    this.$compendium = this.http
      .get<AschenbachCompendium>(`${this.localPath}/5e-SRD.json`)
      .pipe(
        catchError((error) =>
          this.handleError(error, 'StaticAschenbachOracle'),
        ),
        shareReplay(1),
      );

    return this.$compendium;
  }

  /**
   * Busca un monstruo por nombre/slug.
   */
  getMonster(slug: string): Observable<CompendiumResource> {
    return this.loadCompendium().pipe(
      map((data) => {
        const monster = data.monster?.find(
          (m) => m.name.toLowerCase().replaceAll(/\s+/g, '-') === slug,
        );
        if (!monster)
          throw new Error(`Monster '${slug}' not found in static data.`);
        return StaticDataNormalizer.toResourceFromMonster(monster);
      }),
      catchError((error) => this.handleError(error, 'StaticMonsterOracle')),
    );
  }

  /**
   * Busca un hechizo por nombre/slug.
   */
  getSpell(slug: string): Observable<CompendiumResource> {
    return this.loadCompendium().pipe(
      map((data) => {
        const spell = data.spell?.find(
          (s) => s.name.toLowerCase().replaceAll(/\s+/g, '-') === slug,
        );
        if (!spell)
          throw new Error(`Spell '${slug}' not found in static data.`);
        return StaticDataNormalizer.toResourceFromSpell(spell);
      }),
      catchError((error) => this.handleError(error, 'StaticSpellOracle')),
    );
  }

  private handleError(error: unknown, source: string): Observable<never> {
    const connectorError = ConnectorError.fromHttpError(error, source);
    return throwError(() => connectorError);
  }
}
