import { CommonModule } from '@angular/common';
import { DndApiService } from './../../Services/DndService/dnd-api.service';
import { Component, inject } from '@angular/core';
import { DndClass, DndEndpoints } from '../../core/Interfaces/dn-d-interfaz';

@Component({
  selector: 'app-buscador',
  imports: [CommonModule],
  templateUrl: './buscador.component.html',
  styleUrl: './buscador.component.scss',
  standalone: true,
})
export class BuscadorComponent {
  private dnDService = inject(DndApiService); // injeccion del servicio
  // Puedes almacenar los datos aquí si lo deseas
  get dndData() {
    return this.dnDService.data();
  }

  // onFetchClases() {
  //   this.dnDService.getDnD('classes');
  // }

  // onFetchSpells() {
  //   this.dnDService.getDnD('spells');
  // }
  constructor() {
    // Ejemplo de cómo podrías obtener los datos usando el servicio
    //  this.dnDService.getDnD().subscribe(data => this.dndData = data)
  }
}
