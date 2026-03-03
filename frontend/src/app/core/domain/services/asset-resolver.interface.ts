/**
 * BONES — Contrato para el resolvedor de activos.
 * Permite que el dominio y los casos de uso obtengan URLs válidas
 * sin conocer si el origen es local o un CDN externo.
 */
export interface IAssetResolver {
  /**
   * Resuelve una ruta interna (ej: "manuals/phb.pdf") a una URL absoluta.
   * @param path Ruta relativa del recurso.
   * @returns URL completa lista para ser consumida por el cliente.
   */
  resolve(path: string): string;

  /**
   * Indica si el sistema está utilizando actualmente el Nexus externo.
   */
  readonly isUsingExternalNexus: boolean;
}
