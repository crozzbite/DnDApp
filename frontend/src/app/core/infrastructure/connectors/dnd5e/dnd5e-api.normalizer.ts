import { CompendiumResource } from '@domain/models/resource.model';
import { Dnd5eMonsterResponse, Dnd5eSpellResponse } from './dnd5e-api.types';

/**
 * FLESH (Processing) — Normalizadores puros para el conector SRD.
 * Se encarga de convertir el formato snake_case de la API externa
 * al formato camelCase y estructura plana de CompendiumResource de Bones.
 */
export class Dnd5eApiNormalizer {
  static toResourceFromMonster(
    monster: Dnd5eMonsterResponse,
  ): CompendiumResource {
    return {
      id: `dnd5e-monster-${monster.index}`,
      index: monster.index,
      name: monster.name,
      category: 'monster',
      source: 'srd',
      description:
        monster.desc || monster.type || 'Sin descripción disponible del SRD.',
      tags: [monster.alignment, monster.size, monster.type].filter(Boolean),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  static toResourceFromSpell(spell: Dnd5eSpellResponse): CompendiumResource {
    return {
      id: `dnd5e-spell-${spell.index}`,
      index: spell.index,
      name: spell.name,
      category: 'spell',
      source: 'srd',
      description: spell.desc?.join('\n') || 'Sin descripción.',
      tags: [
        spell.school?.name,
        `Nivel ${spell.level}`,
        spell.casting_time,
      ].filter(Boolean),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }
}
