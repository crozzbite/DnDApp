# Specification: The Cache Mantle (Redis)

## 1. Overview

El **Cache Mantle** es la capa de aceleración ultra-rápida del Nexus. Su misión es interceptar las lecturas pesadas hacia el SQL Tome y proporcionar respuestas en milisegundos, garantizando una UX fluida durante sesiones de juego intensas.

## 2. Caching Strategy (The Speed of Thought)

### 2.1 Key Namespacing & Schema

Utilizamos una jerarquía de llaves para evitar colisiones y facilitar la invalidación masiva:

- `nexus:resource:{index}` -> Objeto JSON normalizado.
- `nexus:search:{hash}` -> Listado de IDs resultantes de una búsqueda recurrente.
- `nexus:session:{anonymous_id}` -> Estado efímero del usuario (Recientes, Encuentro actual).
- `nexus:rate-limit:{ip}` -> Contadores para protección de la API.

### 2.2 Eviction Policy (Memory Management)

Para el estudio SkullRender, el manejo eficiente de la memoria es prioridad:

- **Policy**: `allkeys-lru` (Least Recently Used). Cuando la memoria se llena, Redis elimina los recursos menos consultados.
- **Max Memory**: Configurado al 75% de la RAM del nodo para evitar swaps del sistema.

## 3. Estrategia de Sesión Anónima (Shadow Sessions)

Para evitar la fricción de un "Login", utilizaremos una combinación de **Cookies HttpOnly** y Redis para mantener el estado del jugador sin comprometer la seguridad.

### 3.1 El Flujo del Nexo (HttpOnly Strategy)

1. **Identificación**: Cuando un usuario entra, el Gateway genera un `anonymous_id` (UUID) si no existe uno.
2. **Persistence (HttpOnly Cookies)**: Este ID se envía al cliente en una cookie con los flags `HttpOnly`, `Secure` y `SameSite=Strict`.
   - **¿Cómo funciona?**: Al ser `HttpOnly`, el código JavaScript malicioso (XSS) no puede robar el ID. El navegador se encarga de enviarlo automáticamente en los encabezados HTTP de cada petición. Es como una "llave invisible".
3. **Shadow State in Redis**: En Redis, bajo la llave `nexus:session:{anonymous_id}`, guardaremos un "Buffer" de datos:
   - **Historial**: Últimos 5 hechizos/monstros consultados.
   - **Encounter Context**: Si el usuario está simulando un combate, el estado de los HP temporales se guarda aquí.
   - **TTL**: Estas sesiones tienen un tiempo de vida de 7 días. Si el usuario no vuelve, los datos se auto-eliminan.

### 3.2 Beneficios del Buffer en Cache

Al usar buffers en Redis para sesiones anónimas:

- **Zero Latency**: Cargar los monstruos recientes es instantáneo.
- **Stateless Server**: El Gateway no necesita "recordar" al usuario en su RAM; solo lee el ID de la cookie y consulta la "mochila" en Redis.

### 3.3 Buffer Size Constraints (The Integrity Shield)

Para evitar que un usuario malintencionado o un bug sature la memoria de Redis, aplicaremos límites estrictos:

- **Hard Limit de Tamaño**: Cada objeto de sesión no podrá superar los **50 KB**. Si el payload es mayor, el Gateway rechazará la escritura.
- **Límites Lógicos**:
  - `recently_viewed`: Máximo 10 índices.
  - `active_combatants`: Máximo 30 entidades por encuentro.
- **Data Pruning**: El Gateway implementará lógica de "Oldest First" (FIFO) dentro del buffer antes de persistir en Redis para mantener los límites.

## 4. Consumers & Flow Logic

### 4.1 Nexus Gateway (Cache-Aside Pattern)

1. El Gateway recibe una petición por el `index`.
2. Consulta a Redis. Si hay **HIT**, retorna inmediatamente.
3. Si hay **MISS**, consulta al **SQL Tome**, guarda el resultado en Redis con un TTL de 24h y retorna.

### 4.2 Lich Workers (Invalidators)

- **Active Invalidation**: Tras un `UPSERT` en el SQL Tome, el worker ejecuta un `DEL nexus:resource:{index}`.
- **Mass Invalidation**: En cambios de esquema mayores, se utiliza `SCAN` para purgar namespaces específicos.

## 5. CAP Theorem Decision: AP (Availability + Partition Tolerance)

En la capa de Cache, priorizamos un enfoque **AP**.

### ¿Por qué AP?

A diferencia de la base de datos persistente, el Cache Mantle debe estar siempre disponible. Si Redis se desconecta del resto del cluster, preferimos que un nodo sirva una versión ligeramente obsoleta antes que bloquear la API. El Cache es un "acelerador", no la fuente legal de verdad.

## 6. Technical Implementation & Observability

### 6.1 Serialización & Seguridad

- **Serialización**: Utilizaremos **MessagePack** o **JSON comprimido** para reducir el footprint de red y memoria en un 30%.
- **Encryption in Transit**: Todas las conexiones entre el Nexus y Redis DEBEN usar **TLS 1.3**. Ningún alma (dato) viajará en texto plano por la infraestructura del servidor.

### 6.2 Observability (The Watcher)

- **Hit/Miss Rate**: Monitoreo constante. Target > 70%.
- **Latency Monitoring**: Alertar si el `GET` promedio supera los 5ms.
- **Memory Pressure**: Alertas al llegar al 80% de `maxmemory`.

```typescript
// Pattern: SkullRender Resilient Fetch
async function fetchResilient(key: string): Promise<CompendiumResource | null> {
  try {
    const data = await redis.get(key);
    if (data) this.telemetry.count("cache.hit");
    return data ? JSON.parse(data) : null;
  } catch (e) {
    // Fallback silencioso: Si el cache falla, la app sigue viva consultando la DB
    this.logger.warn("Cache Mantle indisponible, recurriendo al SQL Tome");
    return null;
  }
}
```
