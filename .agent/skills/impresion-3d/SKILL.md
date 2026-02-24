---
name: impresion-3d
description: >
  Optimización de modelos, parámetros de impresión y resolución de problemas para impresión 3D (FDM y Resina).
  Trigger: Cuando hables de archivos STL, soportes, laminado, fallos de impresión o materiales 3D.
metadata:
  author: SkullRender
  version: "1.0"
---

## Cuándo Usar

Usa esta skill cuando:
- Necesites ayuda configurando un laminador (Cura, PrusaSlicer, Lychee).
- Tengas fallos de impresión (warping, stringing, capas separadas).
- Quieras optimizar la orientación de una pieza para ahorrar tiempo o material.
- No sepas qué material usar (PLA, PETG, ABS, Resina).
- Necesites feedback sobre la "imprimibilidad" de un modelo 3D.

---

## Patrones Críticos

### Patrón 1: La Regla de la Gravedad (Soportes)
Antes de imprimir, siempre verifica:
1. **Ángulos de 45°**: Cualquier ángulo mayor suele requerir soportes.
2. **Puentes (Bridges)**: Si la distancia es corta, puedes imprimir al aire; si es larga, usa soportes.
3. **Superficie de contacto**: Evalúa la estabilidad de la pieza en la cama.

### Patrón 2: Orientación Estratégica
- **Detalle vs. Fuerza**: La piezas son más débiles entre capas (eje Z). Orienta la pieza para que el esfuerzo no sea paralelo a las capas.
- **Calidad Superficial**: Orienta las caras más importantes hacia arriba o hacia los lados, evitando que los soportes toquen las zonas de mayor detalle.

---

## Árbol de Decisiones (Materiales)

```
¿Es para uso decorativo básico? → PLA (Fácil, baja resistencia)
¿Es una pieza mecánica que estará al sol? → ASA o PETG
¿Buscas el máximo detalle posible (minis)? → Resina (SLA)
¿Necesitas flexibilidad? → TPU
¿Pieza estructural con mucha fricción? → Nylon
```

---

## Solución de Problemas (Troubleshooting)

### El "Warping" (Esquinas levantadas)
1. Limpia la cama con alcohol isopropílico.
2. Nivelar la cama (distancia de una hoja de papel).
3. Usar "Brim" en el laminador.
4. Reducir o apagar el ventilador de capa en las primeras capas.

### "Stringing" (Pelos de plástico)
1. Aumenta la distancia de retracción.
2. Aumenta la velocidad de retracción.
3. Baja la temperatura de impresión 5-10°C.

---

## Ejemplos de Configuración

### Perfil "Daily Driver" (PLA)
- **Capa**: 0.2mm
- **Paredes**: 3
- **Infill**: 10-15% (Giroide para mayor fuerza)
- **Temp**: 200°C / 60°C cama
- **Velocidad**: 50-60 mm/s

### Perfil de "Resistencia"
- **Capa**: 0.16mm
- **Paredes**: 4 o 5
- **Infill**: 40% (Tri-hexagonal)
- **Material**: PETG o ABS

---

## Comandos Rápidos

| Comando | Qué hace |
|---------|----------|
| "Analiza este fallo [foto/descripción]" | Diagnóstico de error |
| "Sugerencia de orientación para [modelo]" | Optimiza posición en cama |
| "¿Qué materiales recomiendas para [uso]?" | Guía de selección |
| "Revisa mi configuración de retracción" | Ajuste fino de parámetros |

---

## Recursos Recomendados

- **Laminadores**: Ultimaker Cura, PrusaSlicer, Bambu Studio.
- **Comunidad**: r/3Dprinting, Thingiverse, Printables.
- **Herramientas**: Calipers (calibrador), Alcohol Isopropílico, Espátula.
