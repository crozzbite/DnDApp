import { ResourceReference } from './dnd-resource.model';

export interface Monster extends ResourceReference {
  size: string;
  type: string;
  subtype?: string;
  alignment: string;
  armorClass: ArmorClass[];
  hitPoints: number;
  hitDice: string;
  hitPointsRoll: string;
  speed: MonsterSpeed;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  proficiencies: Proficiency[];
  damageVulnerabilities: string[];
  damageResistances: string[];
  damageImmunities: string[];
  conditionImmunities: ResourceReference[];
  senses: Record<string, string | number>;
  languages: string;
  challengeRating: number;
  xp: number;
  specialAbilities?: MonsterAction[];
  actions?: MonsterAction[];
  legendaryActions?: MonsterAction[];
}

export interface ArmorClass {
  type: string;
  value: number;
}

export interface MonsterSpeed {
  walk?: string;
  fly?: string;
  swim?: string;
  climb?: string;
}

export interface Proficiency {
  value: number;
  proficiency: ResourceReference;
}

export interface MonsterAction {
  name: string;
  desc: string;
  usage?: Record<string, any>;
}
