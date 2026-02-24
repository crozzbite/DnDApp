import { AppStateService } from '../../../../core/services/app-state/app';
import { Component, inject } from '@angular/core';
import { DndApiService } from '../../../compendium/services/dnd/dnd-api';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent {
  dnDService = inject(DndApiService);
  navbarState = inject(AppStateService);
}
