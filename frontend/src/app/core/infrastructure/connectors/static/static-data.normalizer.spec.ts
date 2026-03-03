import { StaticDataNormalizer } from './static-data.normalizer';
import { AschenbachMonster, AschenbachSpell } from './static-data.types';

describe('StaticDataNormalizer', () => {
  describe('toResourceFromMonster', () => {
    it('should correctly normalize an AschenbachMonster to a CompendiumResource', () => {
      const mockMonster: AschenbachMonster = {
        name: 'Ancient Red Dragon',
        meta: 'Gargantuan dragon, lawful evil',
        'Armor Class': '22 (natural armor)',
        'Hit Points': '546 (28d20 + 252)',
        Speed: '40 ft., climb 40 ft., fly 80 ft.',
        STR: '30',
        STR_mod: '(+10)',
        DEX: '10',
        DEX_mod: '(+0)',
        CON: '29',
        CON_mod: '(+9)',
        INT: '18',
        INT_mod: '(+4)',
        WIS: '15',
        WIS_mod: '(+2)',
        CHA: '23',
        CHA_mod: '(+6)',
        'Saving Throws': 'Dex +7, Con +16, Wis +9, Cha +13',
        Skills: 'Perception +16, Stealth +7',
        'Damage Immunities': 'fire',
        Senses: 'blindsight 60 ft., darkvision 120 ft., passive Perception 26',
        Languages: 'Common, Draconic',
        Challenge: '24 (62,000 XP)',
        Traits: 'Legendary Resistance (3/Day).',
        Actions:
          'Multiattack. The dragon can use its Frightful Presence. It then makes three attacks: one with its bite and two with its claws.',
      };

      const result = StaticDataNormalizer.toResourceFromMonster(mockMonster);

      expect(result.name).toBe('Ancient Red Dragon');
      expect(result.index).toBe('ancient-red-dragon');
      expect(result.category).toBe('monster');
      expect(result.tags).toContain('Gargantuan dragon, lawful evil');
      expect(result.tags).toContain('AC 22 (natural armor)');
      expect(result.tags).toContain('HP 546 (28d20 + 252)');
    });
  });

  describe('toResourceFromSpell', () => {
    it('should correctly normalize an AschenbachSpell to a CompendiumResource', () => {
      const mockSpell: AschenbachSpell = {
        name: 'Fireball',
        level: '3rd-level evocation',
        casting_time: '1 action',
        range: '150 feet',
        components: 'V, S, M (a tiny ball of bat guano and sulfur)',
        duration: 'Instantaneous',
        description: 'A bright streak flashes from your pointing finger...',
        school: 'Evocation',
        source: "Player's Handbook",
      };

      const result = StaticDataNormalizer.toResourceFromSpell(mockSpell);

      expect(result.name).toBe('Fireball');
      expect(result.index).toBe('fireball');
      expect(result.category).toBe('spell');
      expect(result.tags).toContain('3rd-level evocation');
      expect(result.tags).toContain('1 action');
      expect(result.tags).toContain('150 feet');
    });
  });
});
