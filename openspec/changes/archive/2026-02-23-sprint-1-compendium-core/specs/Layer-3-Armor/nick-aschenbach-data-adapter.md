## ADDED Requirements

### Requirement: Carga de JSON Estático

El adaptador DEBE cargar archivos JSON locales desde la ruta de assets definida para la librería dnd-data.

#### Scenario: Carga de base de datos de monstruos offline

- **WHEN** El orquestador solicita datos y la red no está disponible
- **THEN** El adaptador debe leer el archivo `monsters.json` y retornar la colección de objetos.

### Requirement: Transformación de Formato Propietario

Dado que la estructura de nick-aschenbach puede diferir de la API oficial, el adaptador DEBE mapear los campos a la estructura `ResourceReference` o al modelo de dominio.

#### Scenario: Adaptación de nombre de campo

- **WHEN** Se lee un objeto donde el índice es `id` en lugar de `index`
- **THEN** El adaptador debe normalizar el campo a `index` para cumplir con el contrato de dominio.

### Mapa de Referencia (Static JSON Mapping)

| JSON Field (Source) | Domain Field (Target) | Note                                           |
| :------------------ | :-------------------- | :--------------------------------------------- |
| `id` / `slug`       | `index`               | Depende del archivo específico de la librería. |
| `name`              | `name`                |                                                |
| `description`       | `description`         | A menudo ya viene como array en esta fuente.   |
| `stats.hp`          | `hitPoints`           | Mapeo de sub-objetos de monstruos.             |
| `stats.ac`          | `armorClass`          |                                                |

---

## Technical Implementation Snippets (The Local Scribe)

### 📂 Logic: Carga de Assets Locales

El adaptador lee los archivos `static` pre-descargados. Si el archivo no existe, DEBE fallar silenciosamente para no interrumpir el flujo del Orquestador si otras fuentes están disponibles.

```typescript
private readonly DATA_PATH = 'assets/data/dnd-data';

public getStaticResource<T>(category: string): Observable<T[]> {
  const url = `${this.DATA_PATH}/${category}.json`;

  return this.http.get<T[]>(url).pipe(
    map(data => data.map(item => this.normalizeStatic(item, category))),
    catchError(() => {
      // Error silencioso: logeamos pero devolvemos array vacío
      console.warn(`Local Scribe: File ${category}.json not found in assets.`);
      return of([]);
    })
  );
}
```

### 🧩 Logic: Normalización de IDs

```typescript
private normalizeStatic(item: unknown, category: string): CompendiumResource {
  return {
    ...item,
    index: item.id || item.index || item.slug, // Unificación de identificador
    metadata: {
      source: 'nick-aschenbach-data',
      isOffline: true
    }
  };
}
```
