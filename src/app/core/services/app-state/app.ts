import { effect, Injectable, Signal, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AppStateService {
  AppStates = [
    'ability-scores',
    'alignments',
    'backgrounds',
    'classes',
    'conditions',
    'damage-types',
    'equipment',
    'equipment-categories',
    'feats',
    'features',
    'languages',
    'magic-items',
    'magic-schools',
    'monsters',
    'proficiencies',
    'races',
    'rule-sections',
    'rules',
    'skills',
    'spells',
    'subclasses',
    'subraces',
    'traits',
    'weapon-properties',
  ];
  filterState = signal<string>('');

  setState(navarState: string) {
    this.filterState.set(navarState);
  }

  resetFilter() {
    this.filterState.set('');
  }
}
