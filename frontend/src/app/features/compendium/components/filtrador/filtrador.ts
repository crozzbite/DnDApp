import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DndApiService } from '../../services/dnd/dnd-api';
import { CommonModule } from '@angular/common';
import { AppStateService } from '../../../../core/services/app-state/app';

@Component({
  selector: 'app-filtrador',
  imports: [CommonModule],
  templateUrl: './filtrador.html',
  styleUrl: './filtrador.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FiltradorComponent {
  private readonly dnDService = inject(DndApiService);
  private readonly navarState = inject(AppStateService);
  protected readonly ActualState = this.navarState.filterState();
}
