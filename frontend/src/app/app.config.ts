import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { COMPENDIUM_REPO_TOKEN } from '@domain/tokens/repository.tokens';
import { CompendiumRepositoryImpl } from '@core/infrastructure/repositories/compendium.repository';
import { ASSET_RESOLVER_TOKEN } from '@domain/tokens/service.tokens';
import { AssetResolverService } from '@core/services/asset-resolver.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),

    // SkullRender — Wired Infrastructure (Armor Layer)
    { provide: COMPENDIUM_REPO_TOKEN, useClass: CompendiumRepositoryImpl },
    { provide: ASSET_RESOLVER_TOKEN, useClass: AssetResolverService },
  ],
};
