/**
 * BONES (Infrastructure) — Tipos puras representando la respuesta de api.open5e.com
 */

export interface Open5eMonsterResponse {
  slug: string;
  name: string;
  size: string;
  type: string;
  alignment: string;
  hit_points: number;
  hit_dice: string;
  challenge_rating: string;
  desc: string;
  document__title: string;
  [key: string]: unknown;
}

export interface Open5eSpellResponse {
  slug: string;
  name: string;
  desc: string;
  higher_level?: string;
  range: string;
  components: string;
  ritual: 'yes' | 'no';
  duration: string;
  concentration: 'yes' | 'no';
  casting_time: string;
  level: string;
  school: string;
  dnd_class: string;
  [key: string]: unknown;
}

export interface Open5ePaginationResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
