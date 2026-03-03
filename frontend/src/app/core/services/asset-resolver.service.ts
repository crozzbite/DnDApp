import { Injectable } from '@angular/core';
import { IAssetResolver } from '../domain/services/asset-resolver.interface';
import { environment } from '../../../environments/environment';

/**
 * ARMOR — Implementación del AssetResolverService.
 * Actúa como un adaptador que decide si las rutas son locales
 * o deben apuntar al External Asset Nexus.
 */
@Injectable({
  providedIn: 'root',
})
export class AssetResolverService implements IAssetResolver {
  private readonly baseUrl = environment.assetNexusUrl;
  private readonly localFallbackUrl = 'assets/docs/dnd-manuals';

  /**
   * Indica si el sistema está configurado para usar el Nexus.
   */
  public get isUsingExternalNexus(): boolean {
    return environment.useExternalNexus;
  }

  /**
   * Resuelve la ruta a una URL absoluta.
   * Si es modo local, usa la ruta relativa base de la app.
   * Si es modo Nexus, usa la URL configurada en el environment.
   */
  resolve(path: string): string {
    if (!path) return '';

    // Si es una URL absoluta ya, la devolvemos tal cual
    if (path.startsWith('http')) return path;

    // Normalizamos el path (quitando el prefijo local si ya lo trae)
    const normalizedPath = path
      .replace(this.localFallbackUrl, '')
      .replace(/^\/+/, '');

    if (this.isUsingExternalNexus) {
      return `${this.baseUrl}/${normalizedPath}`;
    }

    return `/${this.localFallbackUrl}/${normalizedPath}`;
  }
}
