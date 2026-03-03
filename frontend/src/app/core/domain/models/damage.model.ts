/**
 * Representa el daño y el tipo de dado para mecánicas de D&D.
 */
export interface Damage {
  formula: string; // ej: "2d6 + 4"
  type: string; // ej: "fire", "slashing"
}
