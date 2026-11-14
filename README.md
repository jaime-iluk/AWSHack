# Sala Tranquila · demo

Comunicación entre hospitales públicos y las familias de sus pacientes. Demo hardcodeada para el hackathon.

## Correr

```bash
npm install
npm run dev
```

Abrir http://localhost:3000 → pantalla de 3 columnas: panel del hospital | teléfono de Rosa | web de seguimiento.

## Dónde está cada cosa

- `data/demo.ts` — todos los datos (catálogo de estados, folio U-0231, lugares, preguntas sugeridas).
- `lib/reducer.ts` — **contrato compartido**: forma del estado y acciones. No cambiarlo sin avisar al otro dev.
- `lib/useDemo.ts` — hook de la página + escalamiento simulado (SMS a los 4 s, llamada a los 8 s).
- `lib/agent.ts` — agente con respuestas fijas. Carril B: conectar aquí `/api/agent` (Bedrock) con estas respuestas como respaldo.
- `components/` — `HospitalPanel`, `PhoneSimulator`, `FamilyTracker`. Carril A: rediseñar con los skills de `.kiro/skills/`.
- `public/audio/` — audios pregrabados en náhuatl (ver `LEEME.md`).

Plan y reglas: `.kiro/specs/sala-tranquila-mvp/tasks.md` y `.kiro/steering/`.
