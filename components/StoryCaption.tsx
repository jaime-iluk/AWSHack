"use client";
// Subtítulos para el video: explican qué está pasando en cada momento del guion.
import { ADMISSION } from "@/data/demo";
import type { DemoState } from "@/lib/reducer";
import { fmtElapsed } from "@/lib/useDemo";

type Step = { n: number; title: string; body: string; next?: string };

function stepOf(s: DemoState, linked: boolean): Step {
  const asked = s.messages.some((m) => m.from === "family" && m.kind === "family" && m.text !== "Voy en camino");
  if (!linked)
    return {
      n: 1,
      title: `${ADMISSION.contactName} vincula su teléfono`,
      body: "Escanea el código de la tarjeta que le dieron en urgencias, elige náhuatl y acepta el aviso de privacidad. Sin descargar nada más.",
      next: "En el teléfono: Continuar, Vincular, Acepto.",
    };
  if (s.call.state === "coming")
    return {
      n: 8,
      title: "Llega sin haber esperado en la sala",
      body: `Confirmó en ${fmtElapsed(s.call.startedAt, s.call.confirmedAt)}. El hospital ve que va en camino; ella pudo comer, descansar y conseguir donadores mientras tanto.`,
    };
  if (s.call.state !== "idle")
    return {
      n: 7,
      title: "El aviso urgente siempre llega",
      body: "Si no lo lee, le llega un SMS; si no responde, una llamada con audio en náhuatl. Las malas noticias nunca se dan por mensaje: se le pide ir a hablar con el médico.",
      next: "En el teléfono: Voy en camino.",
    };
  if (s.pendings.length > 0)
    return {
      n: 6,
      title: "Qué se necesita de ella, y para cuándo",
      body: "Enfermería pide donadores de sangre con un toque. La app le explica los pasos y le prepara un mensaje para reenviar.",
      next: "En el panel: El médico quiere hablar.",
    };
  if (asked)
    return {
      n: 5,
      title: "Pregunta lo que necesite",
      body: "El asistente responde solo con lo que el hospital publicó. Si pregunta algo médico, le dice que eso lo informa el médico en persona.",
      next: "En el panel: Se necesitan donadores.",
    };
  if (s.nextReport)
    return {
      n: 4,
      title: "Permiso para descansar",
      body: `No hay nada pendiente antes del informe de las ${s.nextReport}. Puede ir a comer, dormir o respirar un momento: le avisaremos.`,
      next: "En el teléfono: pregunte dónde dormir o qué tiene su paciente.",
    };
  if (s.stage >= 2)
    return {
      n: 3,
      title: "Recibe el aviso en su lengua",
      body: "El estado llega como notificación con audio en náhuatl, validado por intérpretes. Nunca se traduce al vuelo.",
      next: "En el panel: Informe a las 14:00.",
    };
  return {
    n: 2,
    title: "El hospital avisa con un toque",
    body: "Enfermería no escribe nada: elige un estado de un catálogo cerrado, sin información clínica.",
    next: "En el panel: Ya está en atención.",
  };
}

export function StoryCaption({ state, linked }: { state: DemoState; linked: boolean }) {
  const st = stepOf(state, linked);
  return (
    <aside aria-live="polite" className="flex h-full flex-col justify-center gap-4">
      <div className="flex gap-1.5" aria-label={`Paso ${st.n} de 8`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${i < st.n ? "bg-azul" : "bg-linea"}`} />
        ))}
      </div>
      <div key={st.n} className="entra">
        <p className="text-sm font-extrabold text-azul tabular">Paso {st.n} de 8</p>
        <h2 className="mt-1 text-[32px] font-extrabold leading-[1.1] text-balance">{st.title}</h2>
        <p className="mt-3 max-w-[38ch] text-lg leading-relaxed text-tinta-suave text-pretty">{st.body}</p>
        {st.next && <p className="mt-5 w-fit rounded-full bg-white px-4 py-2 text-sm font-bold text-tinta-suave shadow-[0_2px_0_#ebe7e1]">Siguiente: {st.next}</p>}
      </div>
    </aside>
  );
}
