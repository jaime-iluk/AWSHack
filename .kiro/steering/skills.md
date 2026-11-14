---
inclusion: always
---

# Skills del proyecto (Sala Tranquila)

El repo trae 4 skills de diseño y UX en `.kiro/skills/`. Úsalos en todo trabajo de interfaz; no los uses para lógica sin UI (reducer, datos, agente).

| Skill | Cuándo usarlo | Para qué en Sala Tranquila |
| --- | --- | --- |
| `frontend-design` | Al crear una pantalla o componente nuevo | Que la demo tenga identidad propia (cálida, calmada, confiable) y no parezca una plantilla genérica de IA. |
| `ui-ux-pro-max` | Al elegir colores, tipografía, espaciado o patrones de UX | Paleta y fuentes para un servicio de salud público; reglas de accesibilidad y tamaños táctiles. Ejecuta su `scripts/search.py` con `python3`. |
| `impeccable` | Al pulir: jerarquía, microinteracciones, animación, estados vacíos | Que los cambios de estado en el teléfono y la web se sientan fluidos; botones del panel de un solo toque. |
| `web-design-guidelines` | Al terminar un bloque de UI, como revisión | Auditar accesibilidad, foco, contraste y estados antes de ensayar la demo. |

## Prioridades de diseño (no negociables)
- **Familia (teléfono y web de seguimiento):** letra grande, contraste AA, frases cortas en "usted", un solo mensaje principal por pantalla, nada de siglas. Debe sentirse tranquilo, nunca alarmante; los avisos críticos (E07, E08) se distinguen sin usar rojo de emergencia.
- **Panel del hospital:** botones grandes, una acción = un toque, estado visible de cada aviso. El personal está saturado.
- **Fluidez:** transiciones suaves entre estados (la barra de etapas avanza, las burbujas entran), sin animaciones largas que retrasen la demo.
- Respeta siempre las reglas de `product.md`: los skills mejoran la forma, nunca cambian el contenido (cero información clínica, solo textos del catálogo).
