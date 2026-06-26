import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AppStateService } from '../../../../core/services/app-state/app';

@Component({
  selector: 'app-filtrador',
  imports: [],
  templateUrl: './filtrador.html',
  styleUrl: './filtrador.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FiltradorComponent {
  private readonly navarState = inject(AppStateService);
  protected readonly ActualState = this.navarState.filterState();
}
