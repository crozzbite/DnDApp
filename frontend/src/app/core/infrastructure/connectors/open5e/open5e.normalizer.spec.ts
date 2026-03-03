import { Open5eNormalizer } from './open5e.normalizer';
import { Open5eMonsterResponse, Open5eSpellResponse } from './open5e.types';

describe('Open5eNormalizer (The Gauntlet - Pure Functions)', () => {
  it('should normalize a monster response correctly with deterministic ID', () => {
    const mockMonster: Open5eMonsterResponse = {
      slug: 'beholder',
      name: 'Beholder',
      size: 'Large',
      type: 'aberration',
      alignment: 'lawful evil',
      hit_points: 180,
      hit_dice: '19d10+76',
      challenge_rating: '13',
      desc: 'Floating eye monster.',
      document__title: 'SRD 5.1',
    };

    const result = Open5eNormalizer.toResourceFromMonster(mockMonster);

    expect(result.id).toBe('open5e-monster-beholder');
    expect(result.index).toBe('beholder');
    expect(result.source).toBe('open5e');
    expect(result.category).toBe('monster');
    expect(result.tags).toContain('CR 13');
    expect(result.tags).toContain('Large');
    expect(result.tags).toContain('aberration');
  });

  it('should handle missing monster description by using type', () => {
    const mockMonster = {
      slug: 'mimic',
      type: 'monstrosity',
      desc: '',
    } as any;

    const result = Open5eNormalizer.toResourceFromMonster(mockMonster);
    expect(result.description).toBe('monstrosity');
  });

  it('should normalize a spell response correctly with combined description', () => {
    const mockSpell: Open5eSpellResponse = {
      slug: 'fireball',
      name: 'Fireball',
      desc: 'A bright streak flashes...',
      higher_level: 'The damage increases by 1d6...',
      range: '150 feet',
      components: 'V, S, M',
      ritual: 'no',
      duration: 'Instantaneous',
      concentration: 'no',
      casting_time: '1 action',
      level: '3rd-level',
      school: 'Evocation',
      dnd_class: 'Wizard',
    };

    const result = Open5eNormalizer.toResourceFromSpell(mockSpell);

    expect(result.id).toBe('open5e-spell-fireball');
    expect(result.source).toBe('open5e');
    expect(result.description).toContain('A bright streak');
    expect(result.description).toContain('**A Niveles Superiores:**');
    expect(result.tags).toContain('3rd-level');
    expect(result.tags).not.toContain('Ritual');
  });

  it('should add Ritual/Concentration tags if present', () => {
    const mockSpell = {
      ritual: 'yes',
      concentration: 'yes',
      level: '1st',
      desc: 'test',
    } as any;

    const result = Open5eNormalizer.toResourceFromSpell(mockSpell);
    expect(result.tags).toContain('Ritual');
    expect(result.tags).toContain('Concentración');
  });
});
