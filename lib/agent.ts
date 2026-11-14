// Agente de la familia.
// fixedAnswer: respuestas fijas por palabra clave (respaldo).
// askAgent: llama al agente real /api/agent (carril B) y cae a fixedAnswer si falla.
import { HOSPITAL, PLACES, statusByCode } from "@/data/demo";
import type { DemoState } from "@/lib/reducer";

const CLINICAL = ["qué tiene", "que tiene", "diagnóstico", "diagnostico", "medicina", "medicamento", "grave", "se va a morir", "pronóstico", "pronostico", "cáncer", "cancer"];
const SLEEP = ["dormir", "albergue", "quedarme", "hospedaje", "descansar"];
const FOOD = ["comer", "comida", "comedor", "hambre"];

const has = (text: string, words: string[]) => words.some((w) => text.includes(w));

export function fixedAnswer(question: string, state: DemoState): string {
  const q = question.toLowerCase();
  const report = state.nextReport ?? "el próximo informe";

  if (has(q, CLINICAL)) {
    return `Eso se lo informa el médico en persona. El próximo informe es a las ${report}. Si quiere, le aviso cuando falten 15 minutos.`;
  }
  if (has(q, SLEEP)) {
    const p = PLACES.find((x) => x.type === "albergue")!;
    return `${p.name}: ${p.walk}. ${p.hours}, ${p.cost.toLowerCase()}. Tenía ${p.beds} camas libres a las ${p.bedsReportedAt}. Le avisaremos aquí si su paciente la necesita.`;
  }
  if (has(q, FOOD)) {
    const p = PLACES.find((x) => x.type === "comedor")!;
    return `${p.name}: ${p.walk}. ${p.hours}. ${p.cost}.`;
  }
  if (q.includes("cómo va") || q.includes("como va") || q.includes("estado")) {
    return `Último aviso del hospital: ${statusByCode(state.status).es}`;
  }
  return `Soy un asistente automático de ${HOSPITAL.name}. Puedo decirle cómo va su paciente, dónde comer o dormir cerca, o comunicarle con una persona.`;
}

const AGENT_TIMEOUT_MS = 9000;

// Carril B (B1): pregunta al agente real en /api/agent (Bedrock).
// Si NEXT_PUBLIC_DEMO_OFFLINE=1, no hay red o algo falla, responde fixedAnswer: la demo nunca se queda sin respuesta.
export async function askAgent(question: string, state: DemoState): Promise<string> {
  if (process.env.NEXT_PUBLIC_DEMO_OFFLINE === "1") {
    await new Promise((r) => setTimeout(r, 700)); // simula que escribe
    return fixedAnswer(question, state);
  }
  try {
    const res = await fetch("/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: question,
        state: { status: state.status, stage: state.stage, nextReport: state.nextReport, pendings: state.pendings },
      }),
      signal: AbortSignal.timeout(AGENT_TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as { reply?: unknown };
    if (typeof data.reply !== "string" || !data.reply) throw new Error("respuesta vacía");
    return data.reply;
  } catch {
    return fixedAnswer(question, state);
  }
}
