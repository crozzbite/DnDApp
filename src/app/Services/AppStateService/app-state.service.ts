import { Injectable, Signal, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppStateService {
  AppStates = [
    'ability-scores', 'alignments', 'backgrounds', 'classes', 'conditions',
    'damage-types', 'equipment', 'equipment-categories', 'feats', 'features',
    'languages', 'magic-items', 'magic-schools', 'monsters', 'proficiencies',
    'races', 'rule-sections', 'rules', 'skills', 'spells',
    'subclasses', 'subraces', 'traits', 'weapon-properties'
  ];
    private _filterState = signal<string | null>(null);
   
      get filterState(): Signal<string | null> {
    return this._filterState;
  }
  SetState(value: string){
    this._filterState.set(value);
    console.log(value);
    
  }

  resetFilter() {
    this._filterState.set(null);
  }

  constructor() { }
}
