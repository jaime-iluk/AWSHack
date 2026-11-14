# Estructura del proyecto

## Modo demo (hackathon, 2 horas) — usar esta estructura
```
sala-tranquila/
├── app/page.tsx              # (o src/App.tsx) 3 columnas: panel | teléfono | web de seguimiento
├── components/
│   ├── HospitalPanel.tsx     # 4 botones: E02, B01, E08, E07
│   ├── PhoneSimulator.tsx    # burbujas, audio, "Voy en camino", chat con chips
│   └── FamilyTracker.tsx     # barra de etapas, próximo informe, pendientes, "puede descansar"
├── lib/
│   ├── reducer.ts            # estado + acciones + escalamiento con setTimeout
│   └── agent.ts              # respuestas fijas por palabra clave
├── data/demo.ts              # catálogo, textos es/nah, lugares, folio U-0231
└── public/audio/             # (opcional) un audio pregrabado en náhuatl
```

## Estructura de producción (fase siguiente, NO construir para la demo)

```
sala-tranquila/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI app, routers
│   │   ├── core/                   # config, seguridad, cifrado, firma de enlaces
│   │   ├── models/                 # SQLAlchemy: hospital, staff_user, admission, status_event,
│   │   │                           # pending_item, broadcast, family_contact, message_log,
│   │   │                           # volunteer, volunteer_session, place, procedure
│   │   ├── schemas/                # Pydantic
│   │   ├── api/
│   │   │   ├── panel.py            # terminal hospital (auth + roles)
│   │   │   ├── family_web.py       # datos para /f/[token]
│   │   │   ├── webhooks_whatsapp.py
│   │   │   └── webhooks_twilio.py
│   │   ├── services/
│   │   │   ├── status_service.py   # publicar estado, pendientes, informe
│   │   │   ├── notify_service.py   # plantillas, escalamiento WhatsApp → SMS → llamada
│   │   │   ├── linking_service.py  # QR, código de 6 dígitos, consentimiento
│   │   │   ├── places_service.py
│   │   │   ├── procedures_service.py
│   │   │   ├── volunteer_service.py
│   │   │   └── retention_job.py    # borrado a 30 días
│   │   ├── agent/
│   │   │   ├── agent.py            # orquestación del LLM con tool calling
│   │   │   ├── tools.py            # consultar_estado, guia_tramite, buscar_lugares, pedir_voluntario
│   │   │   ├── guardrails.py       # filtros: nada clínico, fuera de tema
│   │   │   └── prompts/system_es.md
│   │   └── speech_client.py        # cliente del servicio de voz
│   ├── migrations/
│   └── tests/
├── speech/                         # servicio de voz (MMS) en GPU
│   ├── server.py                   # /lid, /asr, /tts
│   └── models.md                   # modelos e ISO elegidos
├── web/                            # Next.js
│   ├── app/panel/                  # terminal hospital
│   ├── app/f/[token]/              # seguimiento familiar sin descarga
│   └── components/
├── data/
│   ├── status_catalog.json         # catálogo cerrado de estados
│   ├── messages/es.json            # textos validados por estado
│   ├── messages/nah.json           # náhuatl (validar con intérprete)
│   ├── procedures/                 # guías de trámites en markdown
│   └── places_verified.csv         # albergues y lugares verificados
├── audio/                          # avisos pre-grabados por idioma
├── docker-compose.yml
└── README.md
```

## Convenciones
- Código en inglés; textos al usuario en español (y lenguas del piloto) desde `data/messages/*`, nunca hardcodeados.
- Códigos de estado como enum (`E01`…`E11`) compartido entre backend y web (generar tipos TS desde el JSON).
- Un servicio por responsabilidad; los routers no llaman a Meta/Twilio directamente, siempre vía `notify_service`.
- Toda función que envía algo a una familia registra en `message_log`.
- Fechas en UTC en BD; se muestran en hora de la CDMX.
