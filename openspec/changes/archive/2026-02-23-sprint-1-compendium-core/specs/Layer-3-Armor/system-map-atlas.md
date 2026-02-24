# Specification: The System Map (Atlas of the Multiverse)

## 1. Overview

El **Atlas del Nexo** es la representación visual de cómo fluye la energía (datos) a través de nuestra infraestructura. Este mapa dicta las conexiones físicas y lógicas entre los planos de la interfaz, el portal de entrada y los tomos de almacenamiento.

## 2. Infrastructure Diagram (The Web of Souls)

```mermaid
graph TD
    subgraph Clients ["🌐 Discovery Planes (Clients)"]
        A[Angular Web App]
        B[Adventurer CLI]
    end

    subgraph Entry ["🛡️ The Lich Gate (Gateway)"]
        Gateway[Nexus Gateway - NestJS]
    end

    subgraph Async ["⚙️ The Reaper's Wheel (Processing)"]
        Broker[Soul-Harvesting Broker - Redis/BullMQ]
        WorkerIngest[Lich Worker: Ingestor]
        WorkerVector[Lich Worker: Vector-Sync]
    end

    subgraph Storage ["🏛️ The Tome Suite (Persistence)"]
        Cache[(Cache Mantle - Redis)]
        SQL[(SQL Tome - PostgreSQL)]
        Vector[(Vector Nexus - Pinecone)]
    end

    %% --- Connections & Flows ---

    %% 1. Input Flow
    A & B ---->|TLS 1.3 / HttpOnly Cookies| Gateway

    %% 2. Cache & Session Layer
    Gateway <-->|Session Check / Shadow State| Cache
    Gateway <-->|Cache-Aside (Hit/Miss)| Cache

    %% 3. Precise Retrieval (CP)
    Gateway <-->|Query / Transactional Writes| SQL

    %% 4. Intuitive Retrieval (AP)
    Gateway <-->|Semantic Search Query| Vector

    %% 5. Async Ingestion Pipeline
    Gateway -.->|Enqueue Job| Broker
    Broker --> WorkerIngest
    Broker --> WorkerVector

    %% 6. Data Synchronization
    WorkerIngest -->|Persistence| SQL
    WorkerIngest -->|Active Invalidation| Cache
    WorkerVector -->|Upsert Neural Map| Vector
    SQL -.->|CDC Trigger| Broker
```

## 3. Critical Flow Analysis

### 3.1 El Viaje de una Búsqueda (Search Flow)

1. **Petición**: El Cliente envía una búsqueda semántica ("Criatura de lava").
2. **Identificación**: El Gateway valida la **Shadow Session** en el **Cache Mantle** usando la `HttpOnly Cookie`.
3. **Intuición**: El Gateway consulta al **Vector Nexus** (AP) para obtener los 10 candidatos más probables.
4. **Verdad Legal**: Con esos IDs, el Gateway "hidrata" los datos reales desde el **SQL Tome** (CP).
5. **Retorno**: Se entrega el resultado técnico completo al Cliente en < 400ms.

### 3.2 El Ciclo de Ingesta (Ingestion Flow)

1. **Comando**: Un Admin dispara una actualización vía `/admin/ingest`.
2. **Desacoplamiento**: El Gateway pone el trabajo en el **Broker**. El usuario recibe un `202 Accepted` de inmediato.
3. **Evolución**:
   - El **Worker Ingestor** actualiza el **SQL Tome** e invalida la llave en el **Cache Mantle**.
   - El **Worker Vector-Sync** detecta el cambio, genera el nuevo embedding y actualiza el **Vector Nexus**.

## 4. Connectivity Standards

- **Inter-service Auth**: Todas las comunicaciones internas (Gateway -> Broker -> Workers) se realizan bajo una red privada (_VPC_).
- **Protocol**: TLS 1.3 para todo el tráfico externo y encriptación interna para datos sensibles en Redis.

## 5. Glossary of Core Services (Technical Definitions)

Para mantener la claridad absoluta en el desarrollo, definimos las responsabilidades de cada componente clave:

### 5.1 Entry & Security

- **`Gateway_Session_Guard`**: El centinela que intercepta la `HttpOnly Cookie`. Valida que el ID de sesión sea legítimo antes de permitir cualquier consulta al Nexo.
- **`Anonymous_Session_Interceptor`**: Componente del lado del cliente que se asegura de que el "Hilo de Seda" (la sesión invisible) se mantenga conectado entre el navegador y la API.
- **Notación Funcional**: `Anonymous_Session_Interceptor` ➔ `Gateway_Session_Guard` ➔ `Redis_Session_Manager`.

### 5.2 Retrieval & Performance

- **`SQL_Data_Hydrator`**: Su función es vital. Toma los IDs "secos" (numéricos) obtenidos del oráculo vectorial y los "llena de vida" consultando la información técnica completa en el **SQL Tome**.
- **`Vector_Search_Provider`**: El traductor semántico. Convierte el lenguaje humano ("un bicho de lava") en vectores y consulta el plano neural (**Pinecone**) para encontrar candidatos.
- **`Redis_Session_Manager`**: El encargado de gestionar la "Mochila del Jugador". Lee y escribe los datos efímeros (historial, combate) en el **Cache Mantle**.
- **Notación Funcional (Búsqueda)**: `Search_UI` ➔ `Vector_Search_Provider` ➔ `SQL_Data_Hydrator`.

### 5.3 Ingestion & Workers

- **`Resource_Data_Normalizer`**: El alquimista de datos. Toma entradas crudas (Open5e, PDFs, JSONs externos) y las transforma estrictamente al formato "Bones" (Bases sólidas) del proyecto.
- **`Job_Queue_Producer`**: El motor de despacho. Desacopla las peticiones del usuario de los procesos pesados, enviando tareas al **Broker** para procesamiento asíncrono.
- **`SQL_Persistence_Adapter`**: El puente final hacia la base de datos legal. Se asegura de que cada escritura en **Postgres** cumpla con los estándares de integridad y consistencia.
- **Notación Funcional (Ingesta)**: `Admin_Ingest_Controller` ➔ `Job_Queue_Producer` ➔ `Background_Ingestion_Worker` ➔ `Resource_Data_Normalizer` ➔ `SQL_Persistence_Adapter`.

### 5.4 Vector Synchronization

- **`Vector_Update_Dispatcher`**: El disparador que detecta cambios en la verdad legal y solicita una actualización del mapa neural.
- **`Embedding_Generation_Service`**: El puente hacia el modelo de IA (OpenAI/Mistral) que traduce texto a coordenadas matemáticas.
- **`Vector_Storage_Adapter`**: El encargado de realizar la persistencia física en el plano de **Pinecone**.
- **Notación Funcional (Sincronía)**: `SQL_Persistence_Adapter` ➔ `Vector_Update_Dispatcher` ➔ `Embedding_Generation_Service` ➔ `Vector_Storage_Adapter`.

- **Circuit Breakers**: Cada flecha en el diagrama que apunta a una DB tiene un _Opossum Circuit Breaker_ para evitar fallos en cascada.
