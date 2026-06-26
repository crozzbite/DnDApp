import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { AppStateService } from '../../services/app-state/app';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  private readonly navarState = inject(AppStateService);

  protected readonly stateList = this.navarState.AppStates;
  protected readonly ActualState = this.navarState.filterState;
  protected readonly isOpen = signal(false);

  toggleDropdown() {
    this.isOpen.update((v) => !v);
  }

  ChangeState(item: string) {
    this.navarState.setState(item);
  }
}
