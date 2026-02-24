import { CommonModule } from '@angular/common';
import { DndApiService } from '../../services/dnd/dnd-api.service';
import { Component, inject } from '@angular/core';

@Component({
  selector: 'app-buscador',
  imports: [CommonModule],
  templateUrl: './buscador.component.html',
  styleUrl: './buscador.component.scss',
  standalone: true,
})
export class BuscadorComponent {
  private readonly dnDService = inject(DndApiService);

  get dndData() {
    return this.dnDService.dndclass();
  }
}
