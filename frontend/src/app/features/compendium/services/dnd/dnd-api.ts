import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppStateService } from '../../../../core/services/app-state/app';
import {
  DndClass,
  DndEndpoints,
} from '../../../../core/Interfaces/dn-d-interfaz';

@Injectable({
  providedIn: 'root',
})
export class DndApiService {
  private readonly http = inject(HttpClient);
  private readonly appState = inject(AppStateService);

  readonly url = computed(
    () => `https://www.dnd5eapi.co/api/2014/${this.appState.filterState()}`,
  );

  readonly dndclass = signal<DndEndpoints<DndClass> | null>(null);

  private readonly fetchEffect = effect(() => {
    const finalUrl = this.url();

    this.http.get<DndEndpoints<DndClass>>(finalUrl).subscribe({
      next: (response) => this.dndclass.set(response),
      error: (err) => console.error('API error:', err),
    });
  });
}
