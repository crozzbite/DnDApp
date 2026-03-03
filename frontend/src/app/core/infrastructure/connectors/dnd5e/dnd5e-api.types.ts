/**
 * BONES (Infrastructure) — Tipos puras representando la respuesta de dnd5eapi.co
 */

export interface Dnd5eGenericItem {
  index: string;
  name: string;
  url: string;
}

export interface Dnd5eApiResponse<T> {
  count: number;
  results: T[];
}

export interface Dnd5eMonsterResponse {
  index: string;
  name: string;
  size: string;
  type: string;
  alignment: string;
  hit_points: number;
  hit_dice: string;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  desc?: string;
  url: string;
  [key: string]: unknown; // Permite otros campos (SkullRender: No any)
}

export interface Dnd5eSpellResponse {
  index: string;
  name: string;
  desc: string[];
  range: string;
  components: string[];
  ritual: boolean;
  duration: string;
  concentration: boolean;
  casting_time: string;
  level: number;
  school: { name: string; url: string };
  url: string;
  [key: string]: unknown;
}
