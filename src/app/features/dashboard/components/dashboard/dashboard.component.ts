import { AppStateService } from '../../../../core/services/app-state/app-state.service';
import { Component, inject } from '@angular/core';
import { DndApiService } from '../../../compendium/services/dnd/dnd-api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  dnDService = inject(DndApiService);
  navbarState = inject(AppStateService);
}
