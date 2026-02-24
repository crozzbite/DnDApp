---
name: pinecone
description: Official SkullRender Pinecone Standards for Vector Memory.
metadata:
  version: 1.0.0
  author: SkullRender AI
  tags: [vector-db, memory, indexing, rag]
---

# SKILL: Pinecone Vector Memory (SkullRender Standard)

> [!IMPORTANT]
> **Filosofía**: Memoria de Tier 2 escalable. Preferencia por Serverless Indexes e **Integrated Inference** para reducir la complejidad del pipeline de embeddings.
>
> **Documentation**: [docs.pinecone.io](https://docs.pinecone.io/)

*   Always use namespaces for logical isolation (Latency boost).
*   **Trinidad de la Perfección**:
    1.  **Relevancia**: Hybrid Search + Standalone Rerank + Metadata Filtering.
    2.  **Throughput**: Batch Upserts (max 1000) + Parallel Operations + gRPC.
    3.  **Latencia**: Namespaces + Connection Reuse + Target Index by Host.

## Critical Patterns (The "Must Haves")

### 1. Index Architecture: Serverless vs Pods (Legacy)
*   **Serverless First**: [Default] Usar `spec={"serverless": {"cloud": "aws", "region": "us-east-1"}}`.
*   **Legacy Pods**: [!WARNING] Cuentas creadas tras el 18 de agosto de 2025 NO pueden crear pods. 
*   **Sizing & Pod Selection**:
    *   **S1 (Storage)**: Ideal para >5M vectores donde el costo es prioridad sobre la latencia. Capacidad masiva.
    *   **P1 (Performance)**: Ideal para latencias <100ms. 1M vectores/pod. Estándar para apps de búsqueda rápida.
    *   **P2 (Throughput)**: Máximo QPS y latencia <10ms. Ingesta más lenta. Ideal para tráfico intenso.

### 2. Integrated Inference (Embeddings Integrados)
*   **No Manual Embeddings**: Evitar calcular vectores manualmente en Python si es posible. Usar modelos integrados en Pinecone para `upsert_records` y `query`.
*   **Lean Backend Strategy**: Al usar `upsert_records`, el backend solo envía texto plano. Pinecone hace el embedding. Esto mantiene los "Bones" limpios.

### 3. Metadata & Filtering
*   **Flat JSON Only**: NUNCA usar objetos anidados. Máximo 40KB por récord.
*   **Strict Types**: Strings, Numbers, Booleans o Listas de Strings.
*   **Filtering**: Usar `$and`, `$or` en el top level para combinar consultas.

### 4. Namespace Isolation (Multitenancy)
*   **One Namespace per Tenant**: Usar `namespaces` para separar clientes o usuarios. Es la forma más barata y segura de aislar datos.
*   **Cost Efficiency**: El costo de consulta (Read Units) depende del tamaño del namespace, no del índice total. Consultar un namespace de 1GB cuesta 1 RU, aunque el índice tenga 100GB.
*   **Instant Offboarding**: Para borrar los datos de un usuario, usar `delete(delete_all=True, namespace='user_id')`. Es casi instantáneo.

## 5. Hybrid Search (Dense + Sparse)
*   **Best of Both Worlds**: Combina búsqueda semántica (significado) con léxica (palabras exactas).
*   **Single Index Strategy**: [Recomendado] Usar un solo índice para ambos vectores.
    *   **Requisito**: El índice DEBE usar `metric="dotproduct"`.
    *   **Alpha Weighting**: Control manual del peso entre denso y disperso: `score = (alpha * dense_score) + ((1 - alpha) * sparse_score)`.
*   **Integrated Inference Limitation**: Los índices híbridos de un solo canal NO soportan Integrated Inference actualmente. Requieren que el cliente envíe los vectores pre-calculados.

## 6. Reranking (Two-Stage Retrieval)
*   **Purpose**: Improve precision by scoring the initial `top_k` results with a specialized model.
*   **Integrated Reranking**: [Beta] Usar `index.search` con el parámetro `rerank`.
*   **Standalone Reranking**: [Recomendado para Phylactery] Usar `pc.inference.rerank` sobre los resultados de una consulta híbrida.
*   **Modelos**: `bge-reranker-v2-m3` (multilingüe, alto rendimiento) o `pinecone-rerank-v0`.

## 7. Performance & Optimization (SkullRender Tier)

### Relevance (The Brain)
*   **Reranking**: Siempre usar Standalone Rerank (`bge-reranker-v2-m3`) para refinar el `top_k`.
*   **Metadata Filtering**: Usar filtros para reducir el scope y aumentar precisión.
*   **Chunking Strategy (The Foundation)**:
    *   **Fixed-size chunking**: Punto de partida recomendado. Ajustar según el modelo (e.g., 512-1024 tokens para contexto, 128-256 para granularidad).
    *   **Balance Contexto/Precisión**: Evaluar diferentes tamaños de chunk usando múltiples namespaces en el mismo índice para comparar performance.
    *   **Proceso Iterativo**: No existe una talla única. Iterar basándose en la calidad de las respuestas en RAG.

### Throughput (The Speed)
*   **Batching**: `upsert` en batches de exactamente 1000 o 2MB (lo que ocurra primero).
*   **Parallelism**: Las operaciones de Pinecone son thread-safe. Usar paralelismo para ingesta masiva.
*   **gRPC**: [Obligatorio] Usar `pinecone-client[grpc]` para mejor performance.

### Latency (The Flow)
*   **Target by Host**: En producción, cachear el `host` del índice para evitar el call extra a `describe_index`.
*   **Connection Reuse**: Instanciar el objeto `Index` una sola vez y reutilizarlo.
*   **Avoid Values**: No pedir `include_values=True` a menos que sea estrictamente necesario.

## Anti-Patterns (The "Never Do's")
*   ❌ Usar Pods Legacy a menos que se requiera latencia sub-ms muy específica.
*   ❌ Upserts masivos sin batching (max 1000 records o 2MB por batch).
*   ❌ No manejar `PinceconeApiException` (cuotas, límites de rate).
*   ❌ Intentar hacer `upsert` (vectores) en un índice configurado para `upsert_records` (texto) sin los campos correctos.

## Code Examples

### Good: Create Index with Integrated Inference
```python
from pinecone import Pinecone, ServerlessSpec

pc = Pinecone(api_key="YOUR_API_KEY")

pc.create_index(
    name="phylactery-memory",
    dimension=1536, # Standard for text-embedding-3-small
    metric="cosine", # Standard for OpenAI
    spec=ServerlessSpec(cloud="aws", region="us-east-1"),
    deletion_protection="enabled",
    # Integrated Inference Configuration
    embed={
        "model": "text-embedding-3-small",
        "field_map": {"text": "content"}
    }
)
```

### Good: Search with Integrated Inference
```python
index = pc.Index("phylactery-memory")

results = index.query(
    namespace="thread-123",
    top_k=5,
    vector=[], # Vacío si usamos text
    filter={"category": {"$eq": "security"}},
    include_metadata=True,
    inputs={"text": "How do I secure the backend?"} # Pass text directly
)
```

## Data Ingestion: Upsert vs Import
*   **Upsert**: Para flujo continuo de datos (chats, logs en vivo). Max 1000 récords por batch.
*   **Import (S3/GCS)**: Mandatorio para **ingestas masivas** (>10M vectores). Más eficiente y barato. Requiere archivos Parquet.

## Migration & Lifecycle
*   **Pod to Serverless**: Proceso gratuito. Requiere crear una Collection del index de pods y restaurarla en uno serverless.
*   **Batching**: En pods, los deletes masivos afectan la latencia. Usar batches de ~1000.
