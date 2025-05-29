import { Component, inject, signal } from '@angular/core';
import { DndApiService } from '../../Services/DndService/dnd-api.service';
import { DndEndpoints } from '../../core/Interfaces/dn-d-interfaz';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-filtrador',
  imports: [CommonModule],
  templateUrl: './filtrador.component.html',
  styleUrl: './filtrador.component.scss',
  standalone: true
})
export class FiltradorComponent {

  private dnDService = inject(DndApiService);
  //private appState = inject(AppStateService);


   get dndData() {
    return this.dnDService.data();
  }
  
  
  // FiltredResults(filter:string){
  //   this.dnDService.fetchSpells(filter.toLocaleLowerCase());
  // }

}
