# Painani (antes Sala Tranquila): demo

Comunicación entre hospitales públicos y las familias de sus pacientes. Demo hardcodeada para el hackathon.

## Correr

```bash
npm install
cp .env.example .env.local   # opcional: Bedrock y Twilio. Sin esto funciona con respuestas fijas
npm run dev
```

Abrir http://localhost:3000 → pantalla de 3 columnas: panel del hospital | teléfono de Rosa | web de seguimiento.

## Dónde está cada cosa

- `data/demo.ts` — todos los datos (catálogo de estados, folio U-0231, lugares, preguntas sugeridas).
- `lib/reducer.ts` — **contrato compartido**: forma del estado y acciones. No cambiarlo sin avisar al otro dev.
- `lib/useDemo.ts` — hook de la página + escalamiento simulado (SMS a los 4 s, llamada a los 8 s).
- `lib/agent.ts` — el cliente llama a `/api/agent`; `fixedAnswer` es el respaldo (sin red, sin credenciales o si tarda más de 8 s).
- `app/api/agent/route.ts` — agente con Amazon Bedrock (Converse + tool calling) y guardrail clínico antes del modelo.
- `app/api/notify/route.ts` — al tocar E07 manda un WhatsApp real por el sandbox de Twilio si hay credenciales.
- `PRODUCT.md` — contexto de producto para el skill `impeccable`.
- `components/` — `HospitalPanel`, `PhoneSimulator`, `FamilyTracker`. Carril A: rediseñar con los skills de `.kiro/skills/`.
- `public/audio/` — audios pregrabados en náhuatl (ver `LEEME.md`).

Plan y reglas: `.kiro/specs/sala-tranquila-mvp/tasks.md` y `.kiro/steering/`.
