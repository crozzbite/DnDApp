import { CompendiumResource } from './resource.model';

/**
 * Entidad que representa una Hoja de Personaje o Plantilla técnica.
 */
export interface CharacterSheet extends CompendiumResource {
  category: 'character-sheet';
  type: 'official' | 'custom' | 'class-specific';
  isEditable: boolean;
  assets: {
    pdfUrl: string;
    thumbnailUrl?: string;
    filename: string;
  };
}
