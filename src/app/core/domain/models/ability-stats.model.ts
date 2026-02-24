/**
 * Representa las 6 estadísticas base de cualquier criatura.
 */
export interface AbilityStats {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}

/**
 * Lógica pura de dominio para calcular modificadores.
 */
export const getModifier = (stat: number): number =>
  Math.floor((stat - 10) / 2);
