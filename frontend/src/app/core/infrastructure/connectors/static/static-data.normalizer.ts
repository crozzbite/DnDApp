import { CompendiumResource } from '@domain/models/resource.model';
import { AschenbachMonster, AschenbachSpell } from './static-data.types';

/**
 * FLESH (Processing) — Normalizador para los JSON estáticos (Aschenbach).
 */
export class StaticDataNormalizer {
  static toResourceFromMonster(monster: AschenbachMonster): CompendiumResource {
    // Aschenbach usa un slug simple del nombre
    const index = monster.name.toLowerCase().replaceAll(/\s+/g, '-');

    return {
      id: crypto.randomUUID(),
      index,
      name: monster.name,
      category: 'monster',
      source: 'SRD 5.1 (Nick Aschenbach)',
      description:
        monster.Traits || monster.meta || 'Sin descripción detallada.',
      tags: [
        monster.meta,
        `AC ${monster['Armor Class']}`,
        `HP ${monster['Hit Points']}`,
      ].filter(Boolean),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  static toResourceFromSpell(spell: AschenbachSpell): CompendiumResource {
    const index = spell.name.toLowerCase().replaceAll(/\s+/g, '-');

    return {
      id: crypto.randomUUID(),
      index,
      name: spell.name,
      category: 'spell',
      source: spell.source || 'SRD 5.1 (Nick Aschenbach)',
      description: spell.description,
      tags: [spell.level, spell.school, spell.casting_time, spell.range].filter(
        Boolean,
      ),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }
}
