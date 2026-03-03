/**
 * BONES (Infrastructure) — Esquema de datos locales (Nick Aschenbach SRD).
 */

export interface AschenbachMonster {
  name: string;
  meta: string; // "Medium humanoid (any race), any alignment"
  'Armor Class': string;
  'Hit Points': string;
  Speed: string;
  STR: string;
  STR_mod: string;
  DEX: string;
  DEX_mod: string;
  CON: string;
  CON_mod: string;
  INT: string;
  INT_mod: string;
  WIS: string;
  WIS_mod: string;
  CHA: string;
  CHA_mod: string;
  Traits?: string;
  Actions?: string;
  'Legendary Actions'?: string;
  [key: string]: unknown;
}

export interface AschenbachSpell {
  name: string;
  level: string;
  school: string;
  casting_time: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  source: string;
  [key: string]: unknown;
}

export interface AschenbachCompendium {
  monster?: AschenbachMonster[];
  spell?: AschenbachSpell[];
}
