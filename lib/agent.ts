// Agente de la familia.
// askAgent llama a /api/agent (Bedrock). fixedAnswer es el respaldo: se usa si no hay red,
// si no hay credenciales, si el modelo falla o tarda más de 8 s.
import { HOSPITAL, PLACES, SERVICE_NAME, pendingByCode, statusByCode } from "@/data/demo";
import type { DemoState } from "@/lib/reducer";

const CLINICAL = ["qué tiene", "que tiene", "diagnóstico", "diagnostico", "medicina", "medicamento", "grave", "se va a morir", "pronóstico", "pronostico", "cáncer", "cancer"];
const SLEEP = ["dormir", "albergue", "quedarme", "hospedaje", "descansar"];
const FOOD = ["comer", "comida", "comedor", "hambre"];
const PERSON = ["persona", "humano", "voluntari", "hablar con alguien"];
const PROCEDURES = ["trámite", "tramite", "donador", "papeles", "documento"];

const has = (text: string, words: string[]) => words.some((w) => text.includes(w));

export const isClinical = (question: string) => has(question.toLowerCase(), CLINICAL);

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
  if (has(q, PERSON)) {
    return "Le comunico con una voluntaria de Painani. Le escribirá aquí en unos minutos; habla español y náhuatl.";
  }
  if (has(q, PROCEDURES)) {
    if (state.pendings.some((p) => p.code === "P03")) {
      return `Para ${pendingByCode("P03").es.toLowerCase()}: pida a 2 personas sanas, de 18 a 65 años, que vayan con identificación al banco de sangre de este hospital (horario de ejemplo: 7:00 a 10:00) y den el folio U-0231. Si quiere, le preparo un mensaje para reenviarles.`;
    }
    return "Por ahora no hay trámites pendientes para usted. Si el hospital necesita algo, le aviso aquí.";
  }
  if (q.includes("cómo va") || q.includes("como va") || q.includes("estado")) {
    return `Último aviso del hospital: ${statusByCode(state.status).es}`;
  }
  return `Soy ${SERVICE_NAME}, el asistente automático de ${HOSPITAL.name}. Puedo decirle cómo va su paciente, dónde comer o dormir cerca, o comunicarle con una persona.`;
}

export async function askAgent(question: string, state: DemoState): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch("/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, state }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as { answer?: string };
    if (data.answer) return data.answer;
    throw new Error("respuesta vacía");
  } catch {
    return fixedAnswer(question, state);
  } finally {
    clearTimeout(timeout);
  }
}
