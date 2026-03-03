/**
 * Entidad base para todos los recursos del compendio.
 */
export interface CompendiumResource {
  id: string; // UUID
  index: string; // Slug / Key única (ej: "ancient-red-dragon")
  name: string;
  category:
    | 'monster'
    | 'spell'
    | 'equipment'
    | 'magic-item'
    | 'class'
    | 'race'
    | 'feat'
    | 'background'
    | 'rule'
    | 'npc'
    | 'campaign'
    | 'location'
    | 'plane'
    | 'religion'
    | 'table'
    | 'codex'
    | 'manual'
    | 'character-sheet';
  source: string; // "srd", "custom-homebrew"
  description: string;
  tags?: string[];
  ownerId?: string; // UUID del usuario para recursos privados/guardados
  createdAt?: number;
  updatedAt?: number;
}
