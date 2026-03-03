import { InjectionToken } from '@angular/core';
import { IAssetResolver } from '../services/asset-resolver.interface';

/**
 * TOKEN — Identificador para el resolvedor de activos (AssetResolver).
 */
export const ASSET_RESOLVER_TOKEN = new InjectionToken<IAssetResolver>(
  'ASSET_RESOLVER_TOKEN',
);
