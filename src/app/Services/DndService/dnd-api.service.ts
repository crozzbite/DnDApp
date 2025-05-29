import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DndClass, DndEndpoints } from '../../core/Interfaces/dn-d-interfaz';
import { filter } from 'rxjs';
import { AppStateService } from '../AppStateService/app-state.service';

@Injectable({
  providedIn: 'root',
})
export class DndApiService {
  private http = inject(HttpClient); // injection del servicio http
  private appState = inject(AppStateService); // injeccion del estado de la app
  private dndData = signal<any | null>(null);
  getDnD(): void {
        //✅ Método que hace la petición HTTP y actualiza el signal

    const url: string = `https://www.dnd5eapi.co/api/2014/${this.appState}`;
    this.http.get<DndEndpoints>(`${url}`).subscribe({
      next: (data) => this.dndData.set(data),
      error: (err) => {
        console.error('Error en el DnD API', err);
        alert('no encontramos nada que mostrar ');
      },
    });
  }

  fetchSpells( filters: {level?: number[]; school?: string[]}){
    // metodo que aplica el filtro 
      const params = new URLSearchParams();
      if(filters.level){
        params.append('level', filters.level.join(','));
      }

       if(filters.school){
        params.append('level', filters.school.join(','));
      }
            const url = `https://www.dnd5eapi.co/api/spells?${params.toString()}`;

            this.http.get<any>(url).subscribe({
              next: (data) => this.dndData.set(data.results),
              error: (err) => {
                              console.error('no spells fetch', err),
                              alert('no spells fetched')}
            })
      }

      fetchByEndpoint(endpoint: string) {
  const url = `https://www.dnd5eapi.co/api/2014/${endpoint}`;
  this.http.get<DndEndpoints>(url).subscribe({
    next: (data) => this.dndData.set(data),
    error: (err) => {
      this.dndData.set(null);
      console.error('Error en el DnD API', err);
    },
  });
}

  constructor() {
    // this.getDnD(); // O puedes hacer que sea manual
  }

  get data() {
    // ✅ Getter: se usa en componentes
    return this.dndData;
  }
}
