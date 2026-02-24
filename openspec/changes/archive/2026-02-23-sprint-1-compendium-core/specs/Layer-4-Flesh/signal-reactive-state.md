## ADDED Requirements

### Requirement: Flujo de Datos Unidireccional con Signals

El estado de la aplicación DEBE ser gestionado mediante Signals (`signal`, `computed`, `effect`). No se permiten suscripciones manuales a observables dentro de los componentes para gestión de estado persistente.

#### Scenario: Actualización de filtro de búsqueda

- **WHEN** El usuario escribe en el buscador
- **THEN** Se actualiza un signal `searchTerm`. Un `computed` derivado debe disparar la orquestación de datos de forma automática.

### Requirement: Loading States Reactivos

Cada flujo de datos asíncrono DEBE exponer un signal de estado (`loading`, `error`, `data`) para que la UI pueda reaccionar sin lógica condicional compleja en el template.

#### Scenario: Estado de carga durante orquestación

- **WHEN** El `data-lich-orchestrator` inicia una petición
- **THEN** El signal `isLoading` debe pasar a `true`, bloqueando las interacciones necesarias en la UI.

### Estructura de un Signal State

Cada entidad principal (Spells, Monsters) debe seguir este patrón de signals:

| Signal    | Propósito                                       |
| :-------- | :---------------------------------------------- |
| `data`    | Array o bucket con la información actual.       |
| `loading` | Boolean para estados de carga.                  |
| `error`   | `ConnectorError` o null para gestión de fallos. |
| `filter`  | Criterio de búsqueda activo.                    |

---

## Technical Implementation Snippets (The Pulse)

### ⚡ Logic: Signal Service Pattern

Implementación moderna sin `BehaviorSubject` para un estado puramente reactivo.

```typescript
@Injectable({ providedIn: "root" })
export class CompendiumStore {
  // 1. Private State
  private _monsters = signal<Monster[]>([]);
  private _loading = signal<boolean>(false);
  private _filter = signal<string>("");

  // 2. Public Signals (Read-only)
  public monsters = this._monsters.asReadonly();
  public loading = this._loading.asReadonly();

  // 3. Computed State
  public filteredMonsters = computed(() => {
    const term = this._filter().toLowerCase();
    return this._monsters().filter((m) => m.name.toLowerCase().includes(term));
  });

  // 4. State Mutators
  public updateFilter(term: string) {
    this._filter.set(term);
  }

  public setMonsters(data: Monster[]) {
    this._monsters.set(data);
  }
}
```

### 🔄 Logic: Side Effects (Logging/Persistence)

Uso de `effect` para tareas que no modifican el estado directamente.

```typescript
constructor() {
  effect(() => {
    // Persistimos el filtro en localStorage automáticamente
    console.log('Filtro actualizado:', this._filter());
    localStorage.setItem('dnd_search_pref', this._filter());
  });
}
```
