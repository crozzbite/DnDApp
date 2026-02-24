## ADDED Requirements

### Requirement: Consumo de Endpoints SRD

El conector DEBEN permitir la recuperación de datos de todos los endpoints estándar de dnd5eapi.co (spells, monsters, classes, etc.).

#### Scenario: Recuperación exitosa de lista de hechizos

- **WHEN** Se solicita la lista de hechizos a dnd5eapi.co
- **THEN** El sistema debe retornar un objeto `APIResponse<ResourceReference>` conteniendo los resultados.

### Requirement: Mapeo de Detalle de Recurso

Cada recurso obtenido por su URL individual DEBE ser mapeado al modelo de dominio correspondiente.

#### Scenario: Mapeo de un monstruo específico

- **WHEN** Se obtiene el JSON de un monstruo (e.g., /api/monsters/aboleth)
- **THEN** El conector debe transformar la respuesta al modelo `Monster` definido en el dominio.

### Requirement: Normalización Estructural (Bones Transformation)

El conector DEBE transformar los objetos JSON provenientes de dnd5eapi.co (que usan snake_case) a los modelos de dominio en camelCase para adherirse a los estándares de ingeniería de SkullRender.

#### Scenario: Normalización de campos asíncronos

- **WHEN** Se recibe un objeto con `casting_time` y `higher_level`
- **THEN** El adaptador debe mapearlos a `castingTime` y `higherLevel` respectivamente.

### Mapa de Referencia de Atributos (Mapping Table)

| API Field (Source) | Domain Field (Target) | Type                |
| :----------------- | :-------------------- | :------------------ |
| `index`            | `index`               | `string`            |
| `name`             | `name`                | `string`            |
| `desc`             | `description`         | `string[]`          |
| `higher_level`     | `higherLevel`         | `string[]?`         |
| `casting_time`     | `castingTime`         | `string`            |
| `attack_type`      | `attackType`          | `string?`           |
| `damage_type`      | `damageType`          | `ResourceReference` |
| `url`              | `sourceUrl`           | `string`            |

> [!TIP]
> Todos los campos que involucren una referencia a otro recurso (index, name, url) deben ser encapsulados en el modelo `ResourceReference`.

### Requirement: Optimización de Red (Efficiency)

El conector DEBE implementar una capa de deduplicación de peticiones "en vuelo" para evitar tráfico innecesario.

#### Scenario: Peticiones simultáneas al mismo recurso

- **WHEN** Tres componentes solicitan el hechizo "Fireball" exactamente al mismo tiempo
- **THEN** El conector debe realizar una única petición HTTP y compartir el resultado entre los tres suscriptores (RxJS `shareReplay` o similar).

### Requirement: Validación de Integridad (Defensive Programming)

Antes de proceder con la normalización, el conector DEBE verificar que el JSON recibido es un objeto válido y contiene los campos mínimos de identidad.

#### Scenario: Respuesta corrupta o parcial

- **WHEN** La API devuelve un objeto sin el campo `index`
- **THEN** El conector debe tratarlo como un error de validación y emitir un `ConnectorError` con un mensaje indicando "Invalid Schema".

### Requirement: Respeto a Límites (Rate Limiting)

Para evitar bloqueos de IP, el conector DEBE limitar la tasa de peticiones asíncronas si se detectan ráfagas masivas (e.g., durante una indexación inicial).

El conector NO debe simplemente lanzar una excepción genérica. DEBE devolver un objeto de error estructurado `ConnectorError` que permita al Orquestador tomar decisiones de redundancia (fallback).

#### Estructura del Error (`ConnectorError`)

| Propiedad     | Tipo      | Descripción                                        |
| :------------ | :-------- | :------------------------------------------------- |
| `source`      | `string`  | Nombre del conector (e.g., 'dnd5eapi')             |
| `status`      | `number`  | Código de estado HTTP (0 si es offline)            |
| `message`     | `string`  | Descripción técnica del fallo                      |
| `isRetryable` | `boolean` | `true` si es un error 429 o 5xx, `false` si es 404 |

#### Scenario: Fallo de red con disparo de Fallback

- **WHEN** Una petición a dnd5eapi.co falla con un error 503 (Servicio no disponible)
- **THEN** El conector captura el error via RxJS `catchError`.
- **AND** Emite un `ConnectorError` con `isRetryable: true`.
- **AND** El Orquestador recibe el error y, al ver que la fuente primaria falló, activa automáticamente el `soryy708-static-provider` (JSON local) para no interrumpir al usuario.

### Requirement: Política de Reintentos (Exponential Backoff)

Para errores marcados como `isRetryable`, el conector DEBE implementar una estrategia de reintento inteligente.

#### Scenario: Recuperación de error 503 temporal

- **WHEN** Una petición falla con 503
- **THEN** El conector reintenta la petición hasta 3 veces.
- **AND** Los intervalos de espera deben aumentar exponencialmente (1s, 2s, 4s).

#### Scenario: Recurso no encontrado (404)

- **WHEN** Se busca un hechizo que no existe en dnd5eapi
- **THEN** El conector emite un `ConnectorError` con `isRetryable: false`.
- **AND** El Orquestador informa al usuario que el recurso no existe en esa fuente, evitando ciclos de reintento inútiles.

---

## Technical Implementation Snippets (The Developer's Guide)

### 🧩 Logic: Normalización (Snake to Camel)

El conector debe usar una función pura de mapeo para asegurar la integridad de los **Bones**.

```typescript
// Ejemplo de mapeo para Hechizos
private mapToSpell(apiData: unknown): Spell {
  return {
    index: apiData.index,
    name: apiData.name,
    description: apiData.desc,
    higherLevel: apiData.higher_level || [],
    castingTime: apiData.casting_time,
    range: apiData.range,
    components: apiData.components,
    material: apiData.material,
    ritual: apiData.ritual,
    duration: apiData.duration,
    concentration: apiData.concentration,
    level: apiData.level,
    attackType: apiData.attack_type,
    damage: apiData.damage ? {
      damageType: apiData.damage.damage_type,
      damageAtSlotLevel: apiData.damage.damage_at_slot_level
    } : undefined,
    school: apiData.school,
    classes: apiData.classes,
    subclasses: apiData.subclasses,
    sourceUrl: apiData.url
  };
}
```

### 🛡️ Logic: Resiliencia y Deduplicación (RxJS Power)

Implementación sugerida para el método de obtención de datos, integrando reintentos y deduplicación.

```typescript
public getResource<T>(path: string): Observable<T> {
  const fullUrl = `${this.baseUrl}${path}`;

  // 1. Deduplicación: Si la URL ya está en vuelo, devolvemos el mismo observable
  if (this.pendingRequests.has(fullUrl)) {
    return this.pendingRequests.get(fullUrl)!;
  }

  const request$ = this.http.get<unknown>(fullUrl).pipe(
    // 2. Reintento Inteligente (Exponential Backoff)
    retry({
      count: 3,
      delay: (error, retryCount) => timer(Math.pow(2, retryCount) * 1000)
    }),
    // 3. Normalización
    map(data => this.normalize(data, path)),
    // 4. Captura Estructurada de Errores
    catchError(err => throwError(() => this.handleError(err))),
    // 5. Compartir para deduplicación
    shareReplay(1),
    // 6. Limpiar registro al terminar
    finalize(() => this.pendingRequests.delete(fullUrl))
  );

  this.pendingRequests.set(fullUrl, request$);
  return request$;
}
```

### 📋 Logic: Manejador de Errores Estructurado

```typescript
private handleError(error: HttpErrorResponse): ConnectorError {
  return {
    source: 'dnd5eapi',
    status: error.status,
    message: error.message || 'Unknown provider error',
    isRetryable: error.status === 0 || error.status >= 500 || error.status === 429,
    timestamp: new Date().toISOString()
  };
}
```
