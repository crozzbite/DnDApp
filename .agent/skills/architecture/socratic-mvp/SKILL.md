---
name: socratic-mvp
category: architecture
hierarchy_level: 2
skill_type: methodology
parent_skills: [lich, phylactery-lich]
child_skills: []
priority: critical
applies_to:
  - mvp-discovery
  - domain-modeling
  - architectural-requirements
  - stakeholder-interviews
tags: [socratic, mvp, discovery, domain, requirements, validation]
metadata:
  version: 1.0.0
  author: SkullRender AI
  created: 2026-02-06
---

# Socratic MVP Discovery (Phylactery Lich)

**Description:** Socratic dialogue methodology for extracting MVP scope, domain boundaries, and architectural decisions through strategic questioning. Prevents over-engineering and validates domain models with stakeholders.

**Philosophy:** "El Lich no adivina. El Lich pregunta, valida, construye." (SkullRender)

---

## When to Use

- **MVP Definition:** When defining minimum viable product scope
- **Domain Validation:** When validating entities, aggregates, and invariants with stakeholders
- **Requirements Extraction:** When extracting architectural requirements from non-technical users
- **Scope Refinement:** When stakeholder wants "everything" and you need to force prioritization
- **Architecture Kickoff:** At the start of any architectural design phase (before generating outputs)

---

## 🎯 Methodology: 3-Phase Questioning

### Phase 1: MVP Core (5 preguntas críticas)

**Objetivo:** Definir el alcance mínimo viable SIN feature creep.

1. **¿Qué problema resuelve tu app en UNA frase?**
   - ❌ Respuesta mala: "Es como Slack pero con IA para equipos remotos que..."
   - ✅ Respuesta buena: "Permite a agentes IA ejecutar workflows con aprobación humana"

2. **Si tuvieras que lanzar MAÑANA, ¿qué 3 acciones DEBE poder hacer el usuario?**
   - Forzar priorización
   - Eliminar features "nice to have"
   - Validar: "¿Sin esto, hay producto?"

3. **¿Qué pasaría si esta app NO existiera? ¿Cómo lo resuelven hoy?**
   - Valida si resuelve problema real o problema inventado
   - Identifica competidores/alternativas

4. **¿Cuántos usuarios necesitas para validar el MVP? (10, 100, 1000?)**
   - Define escalabilidad requerida
   - Evita sobre-ingeniería prematura

5. **¿Cuál es el límite de la app? (Qué NO hace)**
   - Previene feature creep
   - Define fronteras del dominio

---

### Phase 2: Domain Validation (4 preguntas técnicas)

**Objetivo:** Validar que el Domain Model refleja la realidad del negocio.

6. **¿Cuáles son las "cosas" principales que existen en tu app?** (Entidades)
   - Ejemplo: Usuario, Conversación, Agente, Skill, Artifact
   - Validar: "¿Esto tiene identidad única (ID)?"
   - Validar: "¿Esto cambia con el tiempo (lifecycle)?"

7. **¿Qué "cosas" SIEMPRE van juntas?** (Aggregates)
   - Ejemplo: Conversación + Mensajes + Artifacts (no puedes tener mensajes sin conversación)
   - Validar: "¿Se crean/borran juntos?"
   - Validar: "¿Comparten transacción en BD?"

8. **¿Qué reglas NUNCA se pueden romper?** (Invariantes de dominio)
   - Ejemplo: "Un usuario no puede tener > 1000 mensajes/día (quota)"
   - Ejemplo: "Un artifact no puede existir sin conversación padre"
   - Estas reglas van en el Domain Layer

9. **¿Qué procesos son largos/asíncronos?** (Eventos de dominio)
   - Ejemplo: "Generar artifact puede tardar 30s (LLM timeout)"
   - Ejemplo: "Comprimir memoria puede tardar 2 min"
   - Estos procesos requieren jobs/queues

---

### Phase 3: Architecture Constraints (4 preguntas estratégicas)

**Objetivo:** Evitar over-engineering Y bajo-engineering.

10. **¿Cuánto tiempo tienes para lanzar? (Semanas, meses)**
    - < 4 semanas → Monolito SQLite
    - 4-12 semanas → Monolito modular + Postgres
    - > 12 semanas → Microservicios (si aplica)

11. **¿Quién va a mantener esto? (Solo tú, equipo 2-5, equipo > 10)**
    - Solo tú → Simplicidad > Escalabilidad
    - Equipo pequeño → Clean Architecture estricta
    - Equipo grande → Microservicios + contratos

12. **¿Qué partes cambian más seguido?**
    - Identifica capas volátiles (Application, Presentation)
    - Identifica capas estables (Domain, Infrastructure)
    - Aplica Dependency Inversion donde hay volatilidad

13. **¿Qué NO puede fallar NUNCA?** (Crítico vs. no crítico)
    - Crítico → Tests E2E, circuit breakers, retries
    - No crítico → Degrada gracefully
    - Ejemplo: "Auth no puede fallar (crítico), generar imagen puede fallar (no crítico)"

---

## 🧠 Validation Rules

Después de las 13 preguntas, validar outputs:

### ✅ Output 1 (Vision) debe tener:
- Problema en 1 frase (pregunta 1)
- 3 casos de uso críticos (pregunta 2)
- Alternativa actual (pregunta 3)
- Target users count (pregunta 4)
- Fronteras claras (pregunta 5)

### ✅ Output 4 (Domain Model) debe tener:
- Entidades de pregunta 6
- Aggregates de pregunta 7
- Invariantes de pregunta 8
- Eventos de pregunta 9

### ✅ Output 13 (Roadmap) debe tener:
- Timeline de pregunta 10
- Estrategia de equipo de pregunta 11

### ✅ Output 12 (Risks) debe tener:
- Componentes críticos de pregunta 13

---

## 💀 SkullRender Rules

1. **No preguntes más de 3-4 a la vez** → Evita overwhelm
2. **Valida respuestas en tiempo real** → "¿Esto es MVP o nice-to-have?"
3. **Detecta contradicciones** → "Dijiste X pero esto implica Y"
4. **Fuerza priorización** → "Si solo pudieras hacer 1, ¿cuál?"

---

## 📊 Output Format

Después de cada respuesta del usuario, generar:

```markdown
## Respuestas capturadas:
- **Problema:** [respuesta pregunta 1]
- **MVP Core:** [respuesta pregunta 2]
- **Alternativa actual:** [respuesta pregunta 3]
...

## Outputs a actualizar:
- [ ] Output 1 (Vision): Actualizar problema statement
- [ ] Output 4 (Domain Model): Agregar entidad X
- [ ] Output 13 (Roadmap): Ajustar timeline a N semanas
```

---

💀 **"El Lich no asume. El Lich pregunta hasta que los huesos hablan."**
