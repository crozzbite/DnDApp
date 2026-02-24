import { CompendiumResource } from './resource.model';

/**
 * Entidad Spell que extiende los Huesos base.
 */
export interface Spell extends CompendiumResource {
  category: 'spell';
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string[];
  duration: string;
  isRitual: boolean;
}
