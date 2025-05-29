import { NgFor } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { AppStateService } from '../../Services/AppStateService/app-state.service';
import { DndApiService } from '../../Services/DndService/dnd-api.service';

@Component({
  selector: 'app-navar',
  imports: [NgFor],
  templateUrl: './navar.component.html',
  styleUrl: './navar.component.scss',
  standalone: true
})
export class NavarComponent {
  private appState = inject(AppStateService);
  private dnDService = inject(DndApiService); // injeccion del servicio
  state : string [] = this.appState.AppStates;
  ActualState: string = ''

  ChangeState(item: string){
    this.appState.SetState(item);
    this.ActualState = item;
    console.log('actualstate:', item);
    this.dnDService.fetchByEndpoint(item);
    console.log(this.dnDService.data);
    alert(item);
  }

}
