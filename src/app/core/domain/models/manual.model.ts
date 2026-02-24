import { CompendiumResource } from './resource.model';

/**
 * Entidad Manual que representa libros y guías del multiverso.
 */
export interface Manual extends CompendiumResource {
  category: 'manual' | 'codex';
  subcategory?: 'core' | 'adventure' | 'supplement' | 'bestiary' | 'rulebook';
  language?: 'es' | 'en';
  author?: string;
  version: string; // ej: "5.0", "Revised"
  pages: number;
  assets: {
    filename: string; // ej: "players-handbook-v5.pdf"
    pdfUrl: string; // Ruta local o remota al binario
    thumbnailUrl?: string;
  };
  tableOfContents: string[]; // Secciones clave indexables
}
