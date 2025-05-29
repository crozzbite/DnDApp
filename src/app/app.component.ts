import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BuscadorComponent } from "./Components/buscador/buscador.component";
import { FiltradorComponent } from "./Components/filtrador/filtrador.component";
import { NavarComponent } from "./Components/navar/navar.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, BuscadorComponent, FiltradorComponent, NavarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'DnDApp';
}
