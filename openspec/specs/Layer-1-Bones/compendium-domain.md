## ADDED Requirements

### Requirement: Definición del Modelo de Referencia Base (Bones)

Todas las entidades del compendio DEBEN extender o basarse en una estructura de referencia común que contenga `index`, `name` y `url` para garantizar la consistencia en el orquestador de datos.

#### Scenario: Creación de una referencia de recurso

- **WHEN** Definimos un nuevo objeto de recurso (e.g., una Escuela de Magia o una Clase)
- **THEN** El objeto debe implementar la interfaz `ResourceReference` con los campos obligatorios.

### Requirement: Estructura Estricta de Hechizos (Layer 1)

Los hechizos deben contener toda la información necesaria para su visualización y filtrado: nivel, escuela, tiempo de lanzamiento, rango, componentes y descripción.

#### Scenario: Validación de objeto Hechizo

- **WHEN** Se recibe un dato de la API de hechizos
- **THEN** El sistema debe tiparlo obligatoriamente usando `Spell` y validar que contenga al menos los campos descriptivos y mecánicos base.

### Requirement: Tipado de Respuestas de API (Contracts)

Todas las respuestas paginadas o de lista de la API deben seguir un esquema genérico `APIResponse<T>`.

#### Scenario: Consumo de lista de recursos

- **WHEN** Se solicita la lista de monstruos o clases
- **THEN** La respuesta debe ser tratada como `APIResponse<Monster>` o `APIResponse<Class>`, exponiendo el conteo total y el array de resultados.
