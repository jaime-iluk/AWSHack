# Implementation Plan — demo de 2 horas

**Objetivo:** una sola pantalla que cuente la historia de Doña Rosa en 3 minutos sin fallar. Es una maqueta interactiva, no un sistema.

**Reglas**
- **Una sola página** Next.js (o Vite + React) con Tailwind. Todo corre **en el navegador**: sin API, sin base de datos, sin login.
- Estado con `useReducer` en el cliente, cargado con los datos de ejemplo. Recargar la página = reiniciar la demo.
- Todo hardcodeado en un solo archivo `data/demo.ts`: catálogo de estados (de `status_catalog.json`), textos en español y náhuatl, 3 lugares, 1 trámite, folio `U-0231`.
- WhatsApp, SMS y llamada se **simulan** en un "teléfono" dibujado en pantalla.
- El agente responde con **respuestas fijas por palabra clave**. Nada de LLM en el camino crítico.
- Se respetan las reglas de producto en los textos: cero información clínica, solo estados del catálogo.

---

## Bloque 1 (≈30 min): base
- [ ] 1. [P0] Crear la app con Tailwind y `data/demo.ts` con todos los datos.
- [ ] 2. [P0] Reducer con acciones: `PUBLISH_STATUS(code)`, `ADD_PENDING(P03)`, `BROADCAST_B01`, `CONFIRM_COMING`, `ASK_AGENT(text)`. Cada acción agrega mensajes a la bandeja del teléfono y actualiza la web.

## Bloque 2 (≈60 min): la pantalla
- [ ] 3. [P0] Layout en 3 columnas: **Panel del hospital** | **Teléfono de Rosa** | **Web de seguimiento**.
- [ ] 4. [P0] Panel: tarjeta del folio con 4 botones grandes, solo los que usa el guion: **E02**, **B01 (informe 14:00)**, **E08 (donadores)**, **E07 (el médico quiere hablar)**. Al llegar a E07 muestra "Esperando confirmación…" y luego "Familiar en camino · 0:12".
- [ ] 5. [P0] Teléfono: burbujas tipo WhatsApp, botón "Escuchar en náhuatl" (un solo audio pregrabado o, si no da tiempo, el texto con la etiqueta "audio"), botón "Voy en camino" y un campo de texto con 2 preguntas sugeridas como chips.
- [ ] 6. [P0] Web de seguimiento: barra de 5 etapas, último cambio, próximo informe, pendientes y el mensaje "No hay nada pendiente para usted antes de las 14:00. Puede ir a comer o descansar".
- [ ] 7. [P0] Escalamiento simulado al tocar E07 con `setTimeout`: a los 4 s "SMS enviado", a los 8 s pantalla de "Llamada entrante · Sala Tranquila". Tocar "Voy en camino" lo cancela.

## Bloque 3 (≈20 min): agente fijo
- [ ] 8. [P0] Respuestas por palabra clave:
  - "dormir", "albergue" → albergue con cupo (nombre, distancia a pie, camas, horario).
  - "qué tiene", "diagnóstico", "medicina", "grave" → "Eso se lo informa el médico en persona. El próximo informe es a las 14:00."
  - cualquier otra → "Soy un asistente automático. Puedo decirle cómo va su paciente, dónde comer o dormir, o comunicarle con una persona."

## Bloque 4 (≈10 min): ensayo
- [ ] 9. [P0] Ensayar el guion 2 veces y grabar la pantalla como respaldo.

## Solo si sobra tiempo
- [ ] 10. [P1] Cambiar el agente fijo por un LLM real (Bedrock) con las respuestas fijas como respaldo.
- [ ] 11. [P1] Pasada visual con el skill `impeccable`.

**Para el pitch como "siguiente fase"** (no se construye): panel real con login, base de datos, WhatsApp Business, SMS y llamadas reales, voz en náhuatl con modelos MMS, voluntarios, lugares y trámites completos, borrado a 30 días, integración con expediente.

---

## Guion de demo (3 minutos)
1. Presentar el problema: familias días enteros en la sala de espera sin saber nada.
2. Enfermería toca **E02** → el teléfono de Rosa recibe el aviso en náhuatl; la web pasa a "En atención".
3. Informes toca **B01** → la web dice "No hay nada pendiente… puede descansar".
4. Rosa pregunta "¿dónde puedo dormir?" → albergue con cupo.
5. Rosa pregunta "¿qué tiene mi esposo?" → "Eso se lo informa el médico… 14:00" (regla: cero información clínica).
6. Enfermería toca **E08** → aparece el pendiente "Conseguir donadores de sangre".
7. Trabajo social toca **E07** → Rosa no contesta → SMS → llamada → "Voy en camino".
8. El panel muestra "Familiar en camino · 0:12". Cierre con métricas del piloto y siguiente fase.
