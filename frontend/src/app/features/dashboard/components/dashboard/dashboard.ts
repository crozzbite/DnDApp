import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DndApiService } from '../../../compendium/services/dnd/dnd-api';

interface QuickCategory {
  key: string;
  label: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  protected readonly dndApi = inject(DndApiService);

  protected readonly searchQuery = signal('');
  protected readonly selectedCategory = signal('spells');

  protected readonly categoryOptions = [
    { value: 'spells', label: 'Spells' },
    { value: 'monsters', label: 'Monsters' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'classes', label: 'Classes' },
    { value: 'races', label: 'Races' },
    { value: 'magic-items', label: 'Magic Items' },
    { value: 'backgrounds', label: 'Backgrounds' },
    { value: 'feats', label: 'Feats' },
    { value: 'skills', label: 'Skills' },
  ];

  protected readonly quickCategories: QuickCategory[] = [
    {
      key: 'spells',
      label: 'Spells',
      description: 'Magical spells and cantrips',
      icon: '✦',
    },
    {
      key: 'monsters',
      label: 'Monsters',
      description: 'Creatures and beasts',
      icon: '⚔',
    },
    {
      key: 'equipment',
      label: 'Equipment',
      description: 'Weapons, armor, and gear',
      icon: '🛡',
    },
    {
      key: 'classes',
      label: 'Classes',
      description: 'Character classes',
      icon: '⚜',
    },
    {
      key: 'races',
      label: 'Races',
      description: 'Player character races',
      icon: '📖',
    },
    {
      key: 'magic-items',
      label: 'Magic Items',
      description: 'Enchanted items and artifacts',
      icon: '🎲',
    },
  ];

  protected onSearch(): void {
    this.dndApi.search(this.searchQuery(), this.selectedCategory());
  }

  protected onBrowse(category: string): void {
    this.selectedCategory.set(category);
    this.searchQuery.set('');
    this.dndApi.browseCategory(category);
  }

  protected onSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onSearch();
    }
  }

  protected apiUrl(path: string): string {
    return `https://www.dnd5eapi.co${path}`;
  }

  protected showQuickAccess(): boolean {
    return !this.dndApi.hasSearched() && !this.dndApi.isLoading();
  }
}
