# Stack técnico y restricciones

> **MODO DEMO (hackathon, 2 horas) — manda sobre el resto de este archivo.**
> Construimos una maqueta interactiva, no un sistema. Sigue `tasks.md`:
> - Una sola página **Next.js (o Vite) + React + TypeScript + Tailwind**. Todo en el navegador: sin API, sin base de datos, sin Docker, sin login.
> - Estado con `useReducer`; todos los datos en `data/demo.ts`.
> - WhatsApp, SMS y llamada **simulados en pantalla**. No integrar Meta, Twilio ni modelos de voz.
> - Agente con **respuestas fijas por palabra clave**. Un LLM real (Bedrock) es opcional y solo con respaldo fijo.
> - Las reglas de producto (cero información clínica, catálogo cerrado, el agente no inventa) **sí se respetan** en los textos.
> El stack de abajo describe la versión de producción (fase siguiente).

## Stack
- **Backend:** Python 3.11+, FastAPI, SQLAlchemy 2, Alembic, Pydantic v2.
- **Base de datos:** PostgreSQL (Supabase o RDS). Cifrado en reposo. Teléfonos cifrados a nivel de columna.
- **Frontend:** Next.js (App Router) + TypeScript + Tailwind. Una sola app con dos zonas:
  - `/panel` → terminal hospital (con login y roles).
  - `/f/[token]` → web de seguimiento para familias (sin login, enlace firmado que caduca).
- **WhatsApp:** WhatsApp Business Cloud API (Meta). Para el hackathon se permite el sandbox de Twilio WhatsApp. Avisos de estado = plantillas aprobadas.
- **SMS y llamada de voz:** Twilio (SMS + llamada que reproduce un audio pre-grabado/sintetizado).
- **Agente:** un LLM con tool calling detrás de una interfaz `LLMClient` (proveedor intercambiable por variable de entorno). Temperatura baja.
- **Voz (Meta MMS / Omnilingual ASR, modelos abiertos en Hugging Face):**
  - Identificación de idioma: `facebook/mms-lid-4017` (o variante más ligera `mms-lid-126` si no alcanza la GPU).
  - Voz a texto: `facebook/mms-1b-all` con adaptador por idioma (o Omnilingual ASR si está disponible en el entorno).
  - Texto a voz: `facebook/mms-tts-<iso>`; verificar qué código ISO de náhuatl tiene modelo TTS publicado y elegir uno para la demo.
  - Corre como servicio separado (`speech/`) en GPU (Colab, servidor del hackathon o instancia con GPU). Si no hay GPU, usar audios pre-grabados para los avisos y solo español en ASR.
- **Lugares:** Google Places API + tabla propia de lugares verificados (albergues, comedores).
- **Despliegue:** contenedores Docker. Preferir infraestructura en México (p. ej. región de nube en México) por la ley de datos.

## Restricciones obligatorias
- **Nunca** guardar ni enviar diagnósticos, notas clínicas, color de triage o texto libre clínico. El panel solo publica códigos del catálogo de estados.
- El folio usa un **token aleatorio**; el nombre del paciente es opcional y solo vive en la tabla del hospital (en el MVP, un campo opcional "iniciales").
- Todo endpoint del panel requiere autenticación y rol; toda publicación queda en bitácora (`status_event` con `staff_id`).
- Enlaces de la web familiar: firmados (HMAC/JWT), caducan a las 24 h, se renuevan con cada aviso.
- Código de vinculación de 6 dígitos con límite de intentos (5 por número por hora).
- Borrado automático de datos de familia y conversación a los 30 días del cierre del folio.
- Mensajes al familiar: frases cortas, lenguaje sencillo, sin siglas sin explicar.
- Accesibilidad: web de seguimiento < 200 KB en la primera carga, funciona en Android de gama baja, contraste AA, fuente grande.

## Variables de entorno (nombres)
`DATABASE_URL`, `ENCRYPTION_KEY`, `LINK_SIGNING_SECRET`, `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID`, `WHATSAPP_VERIFY_TOKEN`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM`, `LLM_PROVIDER`, `LLM_API_KEY`, `LLM_MODEL`, `SPEECH_SERVICE_URL`, `GOOGLE_PLACES_KEY`, `PUBLIC_WEB_URL`.

## Pruebas
- `pytest` para backend; pruebas obligatorias para: catálogo de estados, escalamiento de avisos, permisos del panel, que el agente no responda temas clínicos ni fuera de tema.
- Playwright para el flujo de demo completo.
