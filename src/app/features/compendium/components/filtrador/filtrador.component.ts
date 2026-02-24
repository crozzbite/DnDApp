import { Component, inject } from '@angular/core';
import { DndApiService } from '../../services/dnd/dnd-api.service';
import { CommonModule } from '@angular/common';
import { AppStateService } from '../../../../core/services/app-state/app-state.service';

@Component({
  selector: 'app-filtrador',
  imports: [CommonModule],
  templateUrl: './filtrador.component.html',
  styleUrl: './filtrador.component.scss',
  standalone: true,
})
export class FiltradorComponent {
  private dnDService = inject(DndApiService);
  private navarState = inject(AppStateService);
  protected ActualState = this.navarState.filterState();

  // filterByLevel(level){
  //   this.dnDService.dndclass()
  // }

  // fetchSpells(filters: { level?: number[]; school?: string[] } | null): void {
  //   // metodo que aplica el filtro
  //   const params = new URLSearchParams();
  //   if (filters?.level) {
  //     params.append('level', filters.level.join(','));
  //   }
  // Signal computada para obtener el endpoint actual
  // protected dndEndpoints = computed(() => this.dnDService.fetchByEndpoint(this.ActualState()));

  // Efecto para reaccionar a los cambios de ActualState y actualizar la petición

  // get dndData() {
  //   return this.dnDService.fetchByEndpoint( this.navarState.filterState())
  // }

  // FiltredResults(filter:string){
  //   this.dnDService.fetchSpells(filter.toLocaleLowerCase());
  // }
}
