import { AppStateService } from '../../../../core/services/app-state/app';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DndApiService } from '../../../compendium/services/dnd/dnd-api';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  protected readonly dnDService = inject(DndApiService);
  protected readonly navbarState = inject(AppStateService);
}
