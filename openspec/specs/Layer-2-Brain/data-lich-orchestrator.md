## ADDED Requirements

### Requirement: Estrategia de Resolución de Fuente (Priority)

El Orquestador DEBE decidir de qué fuente extraer la información basado en una prioridad predefinida (1. Cache, 2. API Principal, 3. Open5e, 4. Offline JSON).

#### Scenario: Búsqueda global de un término

- **WHEN** El usuario busca "Fireball"
- **THEN** El Orquestador debe consultar simultáneamente o en orden de prioridad a los conectores y unificar los resultados sin duplicados (basado en `index`).

### Requirement: Consolidación de Metadata

Si un recurso existe en múltiples fuentes (e.g., SRD en API y en JSON local), el Orquestador DEBE fusionar los objetos priorizando la fuente más rica en información.

#### Scenario: Enriquecimiento de Hechizo

- **WHEN** Un hechizo básico de la API carece de descripción detallada pero el JSON local la tiene
- **THEN** El Orquestador debe retornar un objeto híbrido con la descripción más completa.

### Requirement: Unificación de Tipos (The Bones Filter)

Todas las respuestas de cualquier conector DEBEN pasar por el filtro del Orquestador para asegurar que el objeto final cumple 100% con las interfaces de `core/models`.

#### Scenario: Validación de salida

- **WHEN** Un conector devuelve un campo extra no deseado
- **THEN** El Orquestador debe limpiar el objeto dejando solo las propiedades definidas en el Dominio.

### Tabla de Prioridad de Fuentes

| Rango | Fuente        | Propósito                        |
| :---- | :------------ | :------------------------------- |
| 1     | `Cache`       | Velocidad instantánea.           |
| 2     | `dnd-5e-api`  | Fuente estándar oficial (SRD).   |
| 3     | `open5e-api`  | Contenido expandido y OGL.       |
| 4     | `static-json` | Redundancia offline garantizada. |

---

## Technical Implementation Snippets (The Lich Brain)

### 🧠 Logic: Resolución con Fallback (Priority Chain)

El orquestador intenta obtener datos de la fuente primaria y conmuta automáticamente ante fallos.

```typescript
public getMonster(index: string): Observable<Monster> {
  // Intentamos primero la fuente oficial
  return this.dnd5eConnector.getMonster(index).pipe(
    catchError(err => {
      // Si falla y es reintentable o error de red, vamos al fallback offline
      if (err.isRetryable) {
        return this.staticAdapter.getMonster(index);
      }
      return throwError(() => err);
    })
  );
}
```

### 🧬 Logic: Búsqueda Unificada (Merge & Deduplicate)

Búsqueda simultánea en múltiples frentes para una experiencia de compendio total.

```typescript
public searchAll(query: string): Observable<ResourceReference[]> {
  const sources = [
    this.dnd5eConnector.search(query),
    this.open5eConnector.search(query)
  ];

  return forkJoin(sources).pipe(
    map(([official, ogl]) => {
      // Combinamos y eliminamos duplicados basados en el 'index'
      const combined = [...official, ...ogl];
      return Array.from(new Map(combined.map(item => [item.index, item])).values());
    })
  );
}
```
