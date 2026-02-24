/**
 * Valid categories for resource classification in the Nexus.
 */
export enum CompendiumCategory {
  MONSTER = 'monster',
  SPELL = 'spell',
  ITEM = 'item',
  CLASS = 'class',
  RACE = 'race',
  MANUAL = 'manual',
}

/**
 * Known data sources.
 */
export enum CompendiumSource {
  SRD = 'srd',
  OPEN5E = 'open5e',
  DND5EAPI = 'dnd5eapi',
  HOMEBREW = 'homebrew',
}
