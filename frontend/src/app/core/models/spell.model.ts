import { ResourceReference } from './dnd-resource.model';

export interface Spell extends ResourceReference {
  description: string[];
  higherLevel?: string[];
  range: string;
  components: string[];
  material?: string;
  ritual: boolean;
  duration: string;
  concentration: boolean;
  castingTime: string;
  level: number;
  attackType?: string;
  damage?: SpellDamage;
  school: ResourceReference;
  classes: ResourceReference[];
  subclasses: ResourceReference[];
}

export interface SpellDamage {
  damageType: ResourceReference;
  damageAtCharacterLevel?: Record<string, string>;
  damageAtSlotLevel?: Record<string, string>;
}
