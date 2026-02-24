import { AbilityStats } from './ability-stats.model';
import { Damage } from './damage.model';
import { CompendiumResource } from './resource.model';

/**
 * Entidad Monster que extiende los Huesos base.
 */
export interface Monster extends CompendiumResource {
  category: 'monster';
  size: string;
  type: string;
  alignment: string;
  armorClass: number;
  hitPoints: number;
  challengeRating: number;
  stats: AbilityStats;
  specialAbilities?: SpecialAbility[];
  resistances?: string[];
  immunities?: string[];
  vulnerabilities?: string[];
  conditionImmunities?: string[];
  actions: MonsterAction[];
}

export interface SpecialAbility {
  name: string;
  description: string;
}

export interface MonsterAction {
  name: string;
  description: string;
  damage?: Damage[];
}
