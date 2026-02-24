## ADDED Requirements

### Requirement: Filtrado por Fuente OGL

El conector DEBE permitir filtrar los recursos por su fuente original (e.g., Kobold Press, Tome of Beasts) para distinguir el contenido expandido del base.

#### Scenario: Consulta de monstruos de Kobold Press

- **WHEN** El usuario solicita contenido de "Kobold Press"
- **THEN** El conector debe añadir los parámetros de consulta correspondientes a la API de Open5e.

### Requirement: Normalización de Atribuciones

Dado que Open5e mezcla múltiples autores, el conector DEBE incluir el campo de atribución en la metadata del objeto normalizado.

#### Scenario: Ingesta de hechizo OGL

- **WHEN** Se recibe un hechizo desde Open5e
- **THEN** El sistema debe extraer la fuente (`document__title`) y asignarla al campo metadata del objeto de dominio.

### Mapa de Referencia de Atributos (Open5e Mapping)

| Open5e Field (Source)   | Domain Field (Target) | Type       | Note                                                           |
| :---------------------- | :-------------------- | :--------- | :------------------------------------------------------------- |
| `slug`                  | `index`               | `string`   | Open5e usa slugs como identificadores únicos.                  |
| `name`                  | `name`                | `string`   |                                                                |
| `desc`                  | `description`         | `string[]` | Debe dividirse por saltos de línea si viene como string plano. |
| `document__title`       | `metadata.source`     | `string`   | Título del manual original (e.g. "Tome of Beasts").            |
| `document__license_url` | `metadata.license`    | `string`   | URL de la licencia OGL/Creative Commons.                       |
| `level_int`             | `level`               | `number`   |                                                                |

---

## Technical Implementation Snippets (The OGL Adapter)

### 🧩 Logic: Normalización de Hechizos OGL

```typescript
private mapOpen5eToSpell(data: unknown): Spell {
  return {
    index: data.slug, // Normalización de identificador
    name: data.name,
    description: this.formatDescription(data.desc),
    level: data.level_int,
    castingTime: data.casting_time,
    // ... campos estándar
    metadata: {
      source: data.document__title,
      license: data.document__license_url,
      isOgl: true
    }
  };
}

private formatDescription(desc: string): string[] {
  // Open5e suele enviar la descripción como un string largo
  return desc.split('\n').filter(line => line.trim().length > 0);
}
```

### 🔍 Logic: Filtrado por Documento

Para optimizar las búsquedas en el API de Open5e.

````typescript
public searchMonstersBySource(sourceSlug: string): Observable<Monster[]> {
  const params = new HttpParams().set('document__slug', sourceSlug);
  return this.http.get<{ results: unknown[] }>(`${this.baseUrl}/monsters/`, { params }).pipe(
    map(response => response.results.map(m => this.mapOpen5eToMonster(m))),
  );
}

### 📋 Logic: Manejador de Errores OGL-Specific
A diferencia de la API oficial, Open5e puede fallar selectivamente por fuente de datos.

```typescript
private handleError(error: HttpErrorResponse): ConnectorError {
  return {
    source: 'open5e',
    status: error.status,
    message: `OGL Content Error: ${error.error?.detail || error.message}`,
    isRetryable: error.status >= 500, // No reintentamos 404 en OGL porque suele ser contenido no disponible
    timestamp: new Date().toISOString()
  };
}
````

```

```
