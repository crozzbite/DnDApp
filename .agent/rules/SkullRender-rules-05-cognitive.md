---
trigger: always_on
description: RULE 05 - COGNITIVE LAYER. AI, LLMs, Agents, and Vector Memory.
---

# Rule 05: The Cognitive Layer (The Brain)

**"The code thinks. The database remembers."**

---

## 🧠 I. LLM Integration Patterns

### 1. The Gateway Mandate
*   **Direct Access Forbidden**: Never call OpenAI/Anthropic directly from feature code.
*   **Use the Gateway**: All calls pass through a central `LLMService` / Gateway.
*   **Reason**: Observability, Cost Control, Fallback (Model Switching), Rate Limiting.

### 2. Prompt Engineering
*   **Versioned**: Prompts are code. They live in repo (`prompts/`) or a registry.
*   **Structured Output**: JSON Mode is mandatory for programmatic use. Text is only for chat.

---

## 📚 II. RAG Architecture (Retrieval-Augmented Generation)

### The Flow
1.  **Ingest**: Document -> Chunk -> Embed -> Vector DB.
2.  **Retrieve**: Query -> Embed -> Search Vector DB.
3.  **Generate**: Context + Query -> LLM -> Answer.

### Technologies
*   **Vector DB**: **Pinecone** (SaaS) or **Chroma** (Local).
*   **Embeddings**: OpenAI `text-embedding-3-small` (Standard).

---

## 🤖 III. Agent Architecture

### 1. Definition
An Agent is an LLM with **Tools** and a **Loop**.

### 2. Frameworks
*   **LangGraph** (Python): For complex, multi-step state machines.
*   **Vercel AI SDK** (TS): For frontend streaming and simple interactions.

### 3. Memory Types
*   **Short-term**: Context Window (Messages list).
*   **Long-term**: Vector Database (Semantic Search).
*   **Procedural**: Tools/Skills (What it can do).

---

## 🛡️ IV. AI Security (OWASP LLM)
*   **Prompt Injection**: Validate inputs. Use delimiters.
*   **Data Leakage**: Do not put PII in the prompt context without sanitization.