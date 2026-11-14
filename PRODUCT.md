# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
- Familia acompañante en urgencias de hospitales públicos de la CDMX: a menudo viene de pueblos lejanos, puede hablar náhuatl, tiene celular de prepago con poco saldo y batería, y pasa horas o días en salas, pasillos y banquetas.
- Familia en casa o en el pueblo (hasta 3 números por paciente).
- Personal del hospital (triage, enfermería, trabajo social, informes): saturado; cada acción debe costar un toque.
- Para el hackathon: jueces que ven un video grabado de la demo.

## Product Purpose
Painani (náhuatl: "mensajero") lleva los avisos del hospital a la familia para que no tenga que esperar físicamente. Éxito: menos personas en la sala de espera, el familiar llega rápido cuando lo necesitan y sabe cuándo puede descansar.

## Positioning
El hospital publica estados de un catálogo cerrado con un toque; Painani los entrega por WhatsApp, web sin descarga, SMS y llamada, con escalamiento garantizado y en la lengua de la familia (piloto: náhuatl, validado por intérpretes).

## Capabilities and Constraints
- Demo hardcodeada: una página Next.js con panel del hospital, teléfono simulado y web de seguimiento; agente con Bedrock y respaldo fijo.
- Solo estados del catálogo (E01–E11); cero información clínica; las malas noticias nunca por chat ("El médico quiere hablar con usted").
- Textos en náhuatl solo validados por intérpretes; nunca traducción automática.

## Evidence on Hand
- Ninguna métrica real todavía; todos los datos de la demo son de ejemplo (hospital, lugares, folio). No inventar cifras de impacto.

## Product Principles
1. Certeza: si el hospital necesita a la familia, se le avisa sí o sí.
2. Proceso visible: la familia ve en qué etapa va su paciente, como el rastreo de un paquete.
3. Permiso para descansar: decir cuándo no hay nada pendiente.
4. Una persona, no solo un bot.
5. Un humano decide los estados; la IA solo comunica.

## Accessibility & Inclusion
Baja alfabetización y baja visión: letra grande, frases cortas de "usted", contraste AA, Android de gama baja, audio en la lengua de la familia.
