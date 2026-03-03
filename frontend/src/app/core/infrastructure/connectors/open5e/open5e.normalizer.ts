import { CompendiumResource } from '@domain/models/resource.model';
import { Open5eMonsterResponse, Open5eSpellResponse } from './open5e.types';

/**
 * FLESH (Processing) — Normalizadores puros para el conector Open5e.
 * Transforma el esquema de api.open5e.com a CompendiumResource.
 */
export class Open5eNormalizer {
  static toResourceFromMonster(
    monster: Open5eMonsterResponse,
  ): CompendiumResource {
    return {
      id: `open5e-monster-${monster.slug}`,
      index: monster.slug,
      name: monster.name,
      category: 'monster',
      source: 'open5e',
      description:
        [monster.desc, monster.desc ? null : monster.type]
          .filter(Boolean)
          .join('') || 'Sin descripción del compendio Open5e.',
      tags: [
        monster.challenge_rating ? `CR ${monster.challenge_rating}` : '',
        monster.size,
        monster.type,
        monster.alignment,
      ].filter(Boolean),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  static toResourceFromSpell(spell: Open5eSpellResponse): CompendiumResource {
    return {
      id: `open5e-spell-${spell.slug}`,
      index: spell.slug,
      name: spell.name,
      category: 'spell',
      source: 'open5e',
      description: [
        spell.desc,
        spell.higher_level
          ? `\n\n**A Niveles Superiores:** ${spell.higher_level}`
          : null,
      ]
        .filter(Boolean)
        .join(''),
      tags: [
        spell.level,
        spell.school,
        spell.casting_time,
        spell.ritual === 'yes' ? 'Ritual' : '',
        spell.concentration === 'yes' ? 'Concentración' : '',
      ].filter(Boolean),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }
}
