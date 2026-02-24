import { Component, effect, inject, signal } from '@angular/core';
import { AppStateService } from '../../services/app-state/app-state.service';
import { DndApiService } from '../../../features/compendium/services/dnd/dnd-api.service';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  standalone: true,
})
export class NavbarComponent {
  private readonly navarState = inject(AppStateService);
  private readonly dnDService = inject(DndApiService);
  protected stateList: string[] = this.navarState.AppStates;
  protected ActualState: string = '';
  protected isOpen = signal(false);

  private readonly navStateEffect = effect(() => {
    this.ActualState = this.navarState.filterState();
  });

  toggleDropdown() {
    this.isOpen.update((v) => !v);
  }

  ChangeState(item: string) {
    this.navarState.setState(item);
  }
}
