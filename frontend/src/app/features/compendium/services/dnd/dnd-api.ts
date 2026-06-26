import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  DndClass,
  DndEndpoints,
} from '../../../../core/Interfaces/dn-d-interfaz';

const API_BASE = 'https://www.dnd5eapi.co/api/2014';

@Injectable({
  providedIn: 'root',
})
export class DndApiService {
  private readonly http = inject(HttpClient);

  readonly searchResults = signal<DndClass[]>([]);
  readonly isLoading = signal(false);
  readonly selectedCategory = signal('spells');
  readonly hasSearched = signal(false);

  search(query: string, category: string): void {
    this.selectedCategory.set(category);
    this.isLoading.set(true);
    this.hasSearched.set(true);

    this.http.get<DndEndpoints<DndClass>>(`${API_BASE}/${category}`).subscribe({
      next: (data) => {
        let results = data.results ?? [];
        const trimmed = query.trim();
        if (trimmed) {
          const q = trimmed.toLowerCase();
          results = results.filter((item) =>
            item.name.toLowerCase().includes(q),
          );
        }
        this.searchResults.set(results);
        this.isLoading.set(false);
      },
      error: () => {
        this.searchResults.set([]);
        this.isLoading.set(false);
      },
    });
  }

  browseCategory(category: string): void {
    this.search('', category);
  }

  resetSearch(): void {
    this.searchResults.set([]);
    this.hasSearched.set(false);
    this.isLoading.set(false);
  }
}
