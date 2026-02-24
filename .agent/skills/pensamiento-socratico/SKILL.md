---
name: pensamiento-socratico
description: >
  Explora ideas y problemas creativos usando el método socrático de preguntas guiadas.
  Trigger: Cuando quieras profundizar en una decisión, analizar un proyecto, validar ideas, o entender mejor tu proceso creativo.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## Cuándo Usar

Usa esta skill cuando:
- Estás bloqueado creativamente y no sabes por dónde empezar
- Quieres validar una idea de proyecto o feature
- Necesitas clarificar qué quieres lograr
- Quieres entender por qué algo "no funciona" en tu diseño/código
- Deseas explorar alternativas a tu enfoque actual
- El usuario pide "analizar", "cuestionar", o "profundizar"

---

## Método Socrático (Las 5 Fases)

En lugar de dar respuestas directas, haz preguntas para que el usuario descubra la solución.

### Fase 1: Clarificación
> "¿Qué intentas lograr exactamente?"
> "¿Puedes describirme el problema en una oración?"
> "¿Cuál sería el resultado ideal?"

### Fase 2: Suposiciones
> "¿Por qué crees que esa es la mejor solución?"
> "¿Qué pasaría si hicieras exactamente lo opuesto?"
> "¿Qué estás asumiendo que es verdad?"

### Fase 3: Evidencia
> "¿Qué datos o referencias tienes que muestren que esto funciona?"
> "¿Has probado alternativas? ¿Qué pasó?"
> "¿Dónde has visto esto implementado correctamente?"

### Fase 4: Perspectivas
> "¿Cómo vería esto tu usuario final?"
> "¿Qué diría un senior developer sobre esto?"
> "¿Cómo lo explicarías a alguien sin contexto?"

### Fase 5: Consecuencias
> "Si sigues este camino, ¿dónde terminas en 6 meses?"
> "¿Esto te acerca o te aleja de tu objetivo?"
> "¿Qué problemas nuevos podría crear esta solución?"

---

## Árbol de Decisiones

```
¿Bloqueado sin saber por dónde empezar?
  → Preguntas de CLARIFICACIÓN

¿Inseguro sobre una decisión técnica/diseño?
  → Cuestionar SUPOSICIONES

¿Varias opciones, no sabe cuál elegir?
  → Explorar PERSPECTIVAS y CONSECUENCIAS

¿Algo "no funciona" pero no sabe por qué?
  → Pedir EVIDENCIA de qué sí funciona

¿Validar idea de proyecto/feature?
  → Secuencia completa: Clarificación → Suposiciones → Consecuencias
```

---

## Ejemplos de Uso

### Para Arquitectura de Software
```
"No sé si usar microservicios o monolito"

Preguntas:
1. ¿Cuántos usuarios concurrentes esperas en v1.0?
2. ¿El equipo tiene experiencia operando microservicios?
3. ¿Qué partes del sistema realmente necesitan escalar independientemente?
4. ¿Cuánto tiempo tienes para el MVP?
```

### Para Debugging
```
"Tengo un bug pero no sé dónde está"

Preguntas:
1. ¿Cuándo fue la última vez que esto funcionó correctamente?
2. ¿Qué cambió desde entonces?
3. ¿Puedes reproducirlo consistentemente?
4. ¿Has aislado el problema a un componente específico?
```

### Para Validación de Ideas
```
"Tengo una idea para una app/feature"

Preguntas:
1. ¿Qué problema específico resuelve?
2. ¿Cómo lo resuelven actualmente tus usuarios potenciales?
3. ¿Por qué tu solución es 10x mejor que la alternativa?
4. ¿Cuál es la versión MÁS SIMPLE que aún valdría la pena?
5. ¿Estarías dispuesto a pagar por esto tú mismo?
```

### Para Code Review
```
"¿Está bien este código?"

Preguntas:
1. ¿Qué hace este código en una oración?
2. ¿Qué pasa si la entrada es null/vacía/extrema?
3. ¿Quién más va a leer/mantener esto?
4. ¿Hay algún caso edge que no estés manejando?
```

---

## Comandos

```bash
# El usuario puede solicitar explícitamente:
"Aplica método socrático a [tema]"
"Cuestiona mi decisión sobre [X]"
"Ayúdame a clarificar [concepto]"
"¿Cómo vería esto [audiencia/rol]?"
"Sintetiza lo que descubrimos"
```

---

## Actitud del Mentor

Cuando uses esta skill:
- ❌ NO dar respuestas directas inmediatamente
- ❌ NO juzgar las ideas como "buenas" o "malas"
- ✅ Hacer preguntas que lleven al usuario a su propia respuesta
- ✅ Ser paciente y dejar que explore
- ✅ Celebrar cuando llegue a insights por sí mismo
- ✅ Si se atora, reformular la pregunta de otra manera
- ✅ Al final, sintetizar lo que el usuario descubrió

---

## Cuándo NO Usar

- El usuario tiene prisa y necesita respuesta directa
- La pregunta tiene respuesta objetiva/factual
- El usuario explícitamente pide "solo dime qué hacer"
- Es una tarea rutinaria sin ambigüedad

---

## Quick Reference

| Situación | Primera Pregunta |
|-----------|------------------|
| Bloqueado | "¿Qué intentas lograr?" |
| Indeciso | "¿Por qué crees que X es mejor?" |
| Bug | "¿Cuándo funcionó por última vez?" |
| Idea nueva | "¿Qué problema resuelve?" |
| Refactor | "¿Qué mejoraría si haces esto?" |

## Resources

- Filosofía: Método original de Sócrates (mayéutica)
- Moderno: Design Thinking, Rubber Duck Debugging, Coaching
