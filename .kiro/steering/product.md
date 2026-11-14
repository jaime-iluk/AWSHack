# Producto: Sala Tranquila

## Qué es
Sala Tranquila es un sistema de comunicación entre hospitales públicos de la Ciudad de México y las familias de sus pacientes. Su objetivo es que las familias no tengan que quedarse horas o días en salas de espera, pasillos y banquetas para enterarse de cómo va su paciente.

Tiene dos terminales sobre un mismo núcleo:

1. **Terminal hospital (prioridad):** panel web para triage/admisión de urgencias, enfermería y trabajo social. El personal registra un folio, publica el estado del paciente con un toque, manda avisos generales y llamados individuales.
2. **Terminal familia (omnicanal):** WhatsApp como canal principal, web de seguimiento sin descarga (se abre desde un enlace en WhatsApp), SMS y llamada de voz como respaldo. La app nativa queda fuera del MVP.

## Para quién
- **Familia acompañante**, incluida gente que viene de pueblos lejanos, habla una lengua indígena (piloto: náhuatl), tiene celular de prepago con poco saldo y batería, y nunca ha estado en la CDMX.
- **Familia en casa o en el pueblo** (hasta 3 números autorizados por paciente).
- **Personal del hospital:** triage, enfermería, trabajo social, módulo de informes. Están saturados: cada acción debe costar un toque.
- **Voluntarios verificados:** ayudan con trámites, acompañamiento e interpretación.

## Problema (causa raíz)
Nadie en el hospital es dueño de la comunicación con la familia. La única forma de enterarse es estar presente, el hospital necesita a la familia físicamente (firmas, insumos, donadores) y no hay un registro del familiar acompañante, sobre todo en urgencias.

## Qué quita la ansiedad (principios de diseño)
1. **Certeza:** garantía de aviso. Si el hospital necesita a la familia, se le avisa por WhatsApp y, si no responde, por SMS y llamada.
2. **Proceso visible:** la familia ve en qué etapa va su paciente y a qué hora es el próximo informe, como el rastreo de un paquete.
3. **Pendientes claros:** qué se necesita de la familia y para cuándo. Si no hay nada, se dice.
4. **Permiso para descansar:** "No hay nada pendiente para usted antes del informe de las 14:00".
5. **Una persona, no solo un bot:** opción de hablar con un voluntario, idealmente en su lengua.
6. **Lo básico resuelto:** albergues, comida, farmacias, cajeros, baños, puntos de carga.

## Reglas de producto que nunca se rompen
- El agente **solo comunica lo que el hospital publicó**. Nunca inventa, estima ni interpreta el estado de un paciente.
- **Cero información clínica:** no diagnósticos, no medicamentos, no color de triage. Solo estados de un catálogo cerrado.
- **Las malas noticias nunca se dan por chat.** Se usa el estado "El médico quiere hablar con usted".
- **Un humano siempre decide** los estados; la IA solo los comunica y traduce.
- **Avisos de estado = textos pre-validados** por idioma (traducidos por intérpretes humanos). Nunca se traduce al vuelo un aviso sobre el paciente.
- El agente es **acotado a la estancia en el hospital** (estado, trámites, servicios cercanos, voluntario). No es un chat de propósito general (política de WhatsApp Business desde 15-ene-2026).
- Siempre se identifica como asistente automático y ofrece hablar con una persona.

## Fuera del alcance del MVP
- Integración con el expediente o sistemas del hospital (HL7/FHIR, NOM-024). En el MVP el panel es manual.
- App nativa (solo maqueta).
- Pagos, citas médicas, telemedicina.

## Métricas de éxito del piloto
- Personas en la sala de espera a la misma hora, antes vs. después.
- Tiempo entre un llamado y la llegada del familiar.
- Preguntas respondidas por el agente sin pasar por ventanilla.
- Familias registradas y % que usa lengua indígena.
- Satisfacción de la familia (una pregunta por voz al alta).
