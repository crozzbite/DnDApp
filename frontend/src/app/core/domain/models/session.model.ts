/**
 * Representa una sesión de usuario anónima (Shadow Session).
 */
export interface UserSession {
  id: string;
  createdAt: number; // Unix timestamp
  updatedAt: number; // Unix timestamp
  history: string[]; // Últimos índices visitados
  activeEncounter?: ActiveEncounter;
}

/**
 * Orquestador de un encuentro de combate activo.
 */
export interface ActiveEncounter {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  round: number;
  turnIndex: number;
  combatants: EncounterCombatant[];
}

/**
 * Participante en un encuentro de combate.
 */
export interface EncounterCombatant {
  entityIndex: string; // Referencia al Compendium (ej: "goblin")
  instanceId: string; // ID único para esta instancia en el combate
  customName?: string;
  currentHp: number;
  maxHp: number;
  initiative: number;
  updatedAt: number; // Unix timestamp de la última modificación (daño, condición, etc.)
  conditions?: string[]; // ej: "Poisoned", "Prone"
  activeTraits?: string[]; // ej: "Magic Resistance"
}
