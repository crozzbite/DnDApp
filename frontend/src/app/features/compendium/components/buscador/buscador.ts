import { CommonModule } from '@angular/common';
import { DndApiService } from '../../services/dnd/dnd-api';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

@Component({
  selector: 'app-buscador',
  imports: [CommonModule],
  templateUrl: './buscador.html',
  styleUrl: './buscador.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuscadorComponent {
  private readonly dnDService = inject(DndApiService);

  get dndData() {
    return this.dnDService.dndclass();
  }
}
