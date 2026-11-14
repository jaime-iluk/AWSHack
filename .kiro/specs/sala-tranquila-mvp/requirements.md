# Requirements: Sala Tranquila MVP (hackathon)

## Introducción
MVP de dos terminales sobre un mismo núcleo: (1) panel del hospital para urgencias y (2) canales para la familia (WhatsApp, web sin descarga, SMS/llamada). Piloto simulado en un hospital ficticio de IMSS-Bienestar en la CDMX, con español y náhuatl.

Formato: historias de usuario con criterios de aceptación en EARS.

---

## Requisito 1: Registro de folio en urgencias
**Historia:** Como personal de triage o admisión, quiero registrar a un paciente en un solo paso para que su acompañante pueda recibir avisos, aunque el paciente llegue sin documentos.

1. WHEN el personal crea un registro THE SYSTEM SHALL generar un folio legible (p. ej. `U-0231`), un token aleatorio interno y un código de vinculación de 6 dígitos.
2. WHEN se crea el folio THE SYSTEM SHALL generar una tarjeta imprimible con QR, folio y código, con instrucciones en pictogramas.
3. THE SYSTEM SHALL permitir crear un folio sin nombre del paciente (folio provisional) y guardar como máximo iniciales opcionales.
4. THE SYSTEM SHALL registrar el idioma preferido de la familia si el personal lo indica (español por defecto).
5. THE SYSTEM SHALL NOT tener campos de texto libre clínico en el registro.

## Requisito 2: Publicación de estados con un toque
**Historia:** Como enfermería o trabajo social, quiero publicar el estado del paciente con un botón para informar a la familia sin escribir nada.

1. THE SYSTEM SHALL ofrecer solo los estados del catálogo cerrado `data/status_catalog.json` (E01–E11).
2. WHEN el personal toca un estado THE SYSTEM SHALL guardar un `status_event` con folio, código, `staff_id` y hora, y disparar la notificación a los contactos vinculados.
3. WHEN el estado es E07 ("El médico quiere hablar con usted") o E08 ("Se necesita algo de usted") THE SYSTEM SHALL tratarlo como aviso crítico (ver Requisito 5).
4. WHEN el estado es E08 THE SYSTEM SHALL pedir al personal elegir el pendiente de una lista (documento, medicamento/insumo, donadores de sangre, firma) y una hora límite opcional.
5. IF el personal no tiene rol autorizado para el área del folio THEN THE SYSTEM SHALL rechazar la publicación.

## Requisito 3: Avisos generales y llamados
**Historia:** Como módulo de informes, quiero avisar a todas las familias de un área y llamar a una familia específica.

1. WHEN el personal publica un aviso general (B01 "Informe médico a las HH:MM en módulo X", B02 "Alta demanda, la espera puede ser mayor") THE SYSTEM SHALL enviarlo a todos los contactos con folios abiertos en esa área.
2. WHEN se publica B01 THE SYSTEM SHALL actualizar la "hora del próximo informe" de cada folio del área.
3. WHEN el personal hace un llamado individual THE SYSTEM SHALL enviarlo como aviso crítico al folio indicado.
4. THE SYSTEM SHALL mostrar en el panel el estado de entrega de cada llamado (enviado, leído, escaló a SMS/llamada, familiar presente).

## Requisito 4: Vinculación de la familia y consentimiento
**Historia:** Como familiar, quiero escanear un QR y quedar vinculada a mi paciente de forma segura.

1. WHEN el familiar escanea el QR THE SYSTEM SHALL abrir WhatsApp con un mensaje precargado que incluye el folio.
2. WHEN el familiar envía el código de 6 dígitos correcto THE SYSTEM SHALL mostrar el aviso de privacidad corto (texto y audio) y pedir consentimiento expreso ("Acepto").
3. WHEN el familiar acepta THE SYSTEM SHALL vincular su número al folio y guardar fecha y hora del consentimiento.
4. IF se envían 5 códigos incorrectos desde un número en una hora THEN THE SYSTEM SHALL bloquear ese número por una hora.
5. THE SYSTEM SHALL permitir hasta 3 contactos por folio; el primero puede invitar a otros dos con un enlace de invitación.
6. WHEN un contacto escribe "BAJA" o lo pide al agente THE SYSTEM SHALL desvincularlo y confirmar.

## Requisito 5: Notificaciones y escalamiento
**Historia:** Como familiar, quiero la garantía de que me avisarán si me necesitan, aunque no tenga datos.

1. WHEN cambia el estado THE SYSTEM SHALL enviar a cada contacto la plantilla de WhatsApp del estado en su idioma, con un enlace a la web de seguimiento.
2. WHEN un aviso crítico no se lee en 5 minutos THE SYSTEM SHALL enviar un SMS al contacto.
3. WHEN un aviso crítico no se confirma en 10 minutos THE SYSTEM SHALL hacer una llamada de voz que reproduce el aviso en el idioma del contacto.
4. IF el contacto no tiene WhatsApp THEN THE SYSTEM SHALL usar SMS y llamada como canal principal.
5. THE SYSTEM SHALL usar para avisos de estado únicamente textos y audios pre-validados de `data/messages/*` y `audio/*`.

## Requisito 6: Web de seguimiento sin descarga
**Historia:** Como familiar, quiero ver de un vistazo cómo va mi paciente, qué se necesita de mí y si puedo descansar.

1. WHEN el familiar abre el enlace firmado THE SYSTEM SHALL mostrar sin login: etapa actual (barra de etapas), hora del último cambio, hora del próximo informe y pendientes.
2. WHILE no hay pendientes abiertos y existe una hora de próximo informe THE SYSTEM SHALL mostrar el mensaje "No hay nada pendiente para usted antes de las HH:MM. Puede ir a descansar; le avisaremos".
3. THE SYSTEM SHALL mostrar accesos a: trámites, lugares cercanos, pedir voluntario y botón de audio para escuchar la página.
4. IF el enlace caducó THEN THE SYSTEM SHALL pedir solicitar uno nuevo por WhatsApp sin mostrar datos.
5. THE SYSTEM SHALL cargar en menos de 200 KB iniciales y funcionar en Android de gama baja.

## Requisito 7: Agente conversacional acotado
**Historia:** Como familiar, quiero preguntar por texto o voz y recibir respuestas útiles sobre mi estancia.

1. THE SYSTEM SHALL responder solo usando las herramientas `consultar_estado`, `guia_tramite`, `buscar_lugares`, `pedir_voluntario`, `estado_pendientes`.
2. WHEN el familiar pregunta algo clínico (diagnóstico, pronóstico, medicamentos) THE SYSTEM SHALL responder que eso lo informa el médico y dar la hora del próximo informe.
3. WHEN el familiar pregunta algo fuera de la estancia en el hospital THE SYSTEM SHALL redirigir amablemente a lo que sí puede hacer.
4. THE SYSTEM SHALL identificarse como asistente automático en el primer mensaje y ofrecer hablar con una persona.
5. THE SYSTEM SHALL NOT inventar ni estimar estados, tiempos de atención o resultados.

## Requisito 8: Voz e idioma
**Historia:** Como familiar que habla náhuatl, quiero hablar y escuchar en mi lengua.

1. WHEN llega una nota de voz THE SYSTEM SHALL identificar el idioma (MMS-LID), transcribirla (MMS ASR) y pasarla al agente.
2. WHEN el idioma del contacto no es español THE SYSTEM SHALL responder avisos de estado con el audio pre-validado en su idioma.
3. WHEN el agente genera una respuesta libre para un idioma no español THE SYSTEM SHALL usar frases plantilla validadas o, si no existe plantilla, ofrecer un voluntario intérprete.
4. IF la confianza de identificación o transcripción es baja THEN THE SYSTEM SHALL preguntar con botones en pictogramas o escalar a voluntario.

## Requisito 9: Guía de trámites
1. THE SYSTEM SHALL ofrecer al menos 3 guías: documentos de ingreso, donadores de sangre, pase de visita.
2. WHEN el familiar pide una guía THE SYSTEM SHALL devolver una lista de pasos corta y la fecha de última verificación.
3. WHEN la guía de donadores se solicita THE SYSTEM SHALL generar un mensaje listo para reenviar a sus contactos.

## Requisito 10: Servicios cercanos
1. WHEN el familiar pide un lugar (albergue, comida, farmacia, cajero, baño, carga) THE SYSTEM SHALL devolver las 3 opciones más cercanas abiertas ahora con distancia a pie, horario, costo y enlace a mapa.
2. THE SYSTEM SHALL priorizar lugares gratuitos y verificados de `places_verified.csv`.
3. WHERE el albergue reporta cupo THE SYSTEM SHALL mostrar camas disponibles y hora del reporte.

## Requisito 11: Voluntario
1. WHEN el familiar pide una persona, el agente no entiende su idioma o detecta angustia THE SYSTEM SHALL asignar un voluntario disponible priorizando misma lengua.
2. THE SYSTEM SHALL conectar familiar y voluntario por el número del servicio sin revelar teléfonos.
3. THE SYSTEM SHALL NOT mostrar al voluntario el estado del paciente.

## Requisito 12: Tablero del hospital
1. THE SYSTEM SHALL mostrar por área: folios abiertos, contactos vinculados, llamados pendientes, tiempo promedio llamado→llegada, preguntas resueltas por el agente.

## Requisito 13: Privacidad y seguridad
1. THE SYSTEM SHALL cifrar teléfonos en reposo y usar TLS en tránsito.
2. THE SYSTEM SHALL registrar en bitácora cada publicación, lectura del panel y envío.
3. WHEN un folio se cierra (alta, traslado, defunción) THE SYSTEM SHALL invalidar enlaces y programar el borrado de datos de familia y conversación a 30 días.
4. THE SYSTEM SHALL NOT almacenar contenido clínico en ninguna tabla.
