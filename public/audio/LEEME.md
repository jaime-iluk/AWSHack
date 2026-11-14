# Audios de Painani

Cada lengua tiene su carpeta: `nah` (náhuatl), `yua` (maya), `tzh` (tseltal), `tzo` (tsotsil),
`mix` (mixteco), `zap` (zapoteco), `oto` (otomí), `hch` (wixárika).

Si existe `public/audio/<lengua>/<clave>.mp3`, la app lo reproduce. Si no, el celular lee el texto
de `data/lenguas.ts` con la voz en español de México. **Esa voz es solo para la demo**: pronuncia mal
saltillos, glotales y tonos. Los audios reales los graba un intérprete de la comunidad.

Claves que la app usa (una grabación por clave):

| Clave | Dónde suena |
|---|---|
| `onbTitle` | Al tocar la lengua en la bienvenida |
| `bienvenida` | Botón Escuchar de la bienvenida |
| `onbCard` | Paso de la tarjeta |
| `privacidad` | "Antes de empezar" (se reproduce solo) |
| `welcome` | Primer mensaje |
| `E01` … `E11` | Cada estado del paciente (Hoy y Mensajes) |
| `B01` | Aviso del informe médico |
| `P03` | Se necesitan donadores |
| `rest` | Tarjeta "puede descansar" |
| `cerca` | Sección Cerca |
| `ayuda` | Sección Ayuda |
| `E07` | Aviso urgente y llamada |

Todos los textos son borradores: validarlos con hablantes antes de usarlos con familias.
