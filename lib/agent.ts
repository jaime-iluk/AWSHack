// Agente de la familia.
// askAgent llama a /api/agent (Bedrock). fixedAnswer es el respaldo: se usa si no hay red,
// si no hay credenciales, si el modelo falla o tarda más de 8 s.
// Reglas: solo lo que el hospital publicó, cero información clínica, nunca inventar tiempos.
import { ADMISSION, HOSPITAL, PLACES, SERVICE_NAME, STAGES, pendingByCode, statusByCode } from "@/data/demo";
import type { DemoState } from "@/lib/reducer";

// Normaliza: minúsculas, sin acentos ni signos. "¿Qué TIENE?" -> "que tiene"
export const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[¿?¡!.,;:"'()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const has = (q: string, words: string[]) => words.some((w) => q.includes(w));
const isWord = (q: string, words: string[]) => words.includes(q);

// Grupos de intención (ya normalizados). El orden de evaluación importa: ver fixedAnswer.
const SELF_EMERGENCY = ["me siento mal", "me desmayo", "me estoy desmayando", "me duele el pecho", "no puedo respirar", "me voy a desmayar", "estoy sangrando"];
const DONORS = ["donador", "donante", "donar", "banco de sangre", "dar sangre"];
const CLINICAL = [
  "que tiene", "que le paso", "que le pasa", "diagnost", "pronost", "grave", "gravedad", "morir", "muere", "murio", "muerto",
  "falleci", "se va a salvar", "se salva", "va a vivir", "medicina le", "medicamento", "que le dieron", "que le estan dando",
  "enfermedad", "cancer", "infarto", "operacion salio", "salio bien", "resultado", "analisis", "estudios salieron", "esta bien mi",
  "esta mejor", "empeoro", "mejoro", "dolor", "sufre", "inconsciente", "intubad", "coma", "operar", "operacion", "cirugia",
  "le van a hacer", "lo van a", "la van a", "tratamiento", "transfusion", "terapia intensiva",
];
const EMOTION = ["miedo", "preocupad", "nervios", "angusti", "desesperad", "llor", "triste", "no aguanto", "estoy sola", "estoy solo", "ansiedad"];
const GREETING = ["hola", "buenas", "buenos dias", "buenas tardes", "buenas noches", "que tal"];
const THANKS = ["gracias", "muchas gracias", "se lo agradezco", "dios se lo pague"];
const STATUS = ["como va", "como esta", "como sigue", "que paso con", "novedad", "noticia", "alguna informacion", "sabe algo", "donde esta mi", "ya lo atendieron", "ya la atendieron", "estado", "avance", "sigue en"];
const WHEN = ["a que hora", "cuando", "cuanto tiempo", "cuanto tarda", "tardan", "demora", "falta mucho", "hasta que hora", "a que horas"];
const VISIT = ["visita", "visitar", "pasar a ver", "puedo verlo", "puedo verla", "lo puedo ver", "la puedo ver", "puedo ver a", "puedo entrar", "pasar con", "verlo", "verla", "estar con", "acompanarlo", "acompanarla"];
const SLEEP = ["dormir", "duermo", "albergue", "quedarme", "hospedaje", "hotel", "donde quedar", "cama para mi", "pasar la noche", "frio"];
const FOOD = ["comer", "como algo", "comida", "comedor", "hambre", "desayun", "cenar", "almorzar", "agua"];
const PHARMACY = ["farmacia", "comprar medicina", "comprar el medicamento", "comprar material", "receta"];
const BATHROOM = ["bano", "sanitario", "regadera", "banarme", "banar", "wc"];
const CHARGE = ["cargar", "carga", "cargo", "cargue", "bateria", "cargador", "enchufe", "pila", "se me apaga", "sin bateria", "contacto para"];
const MONEY = ["cuesta", "costo", "cobran", "pagar", "pago", "dinero", "gratis", "cuota", "seguro popular"];
const DIRECTIONS = ["como llego", "como llegar", "direccion", "metro", "camion", "taxi", "estacionamiento", "donde queda", "ubicacion"];
const DOCUMENTS = ["papeles", "documento", "ine", "credencial", "acta", "curp", "identificacion", "comprobante"];
const PROCEDURES = ["tramite", "que tengo que hacer", "que necesito", "que hago", "que me piden", "pendiente"];
const PERSON = ["persona", "humano", "voluntari", "hablar con alguien", "operador", "alguien real", "trabajo social", "trabajadora social"];
const LANGUAGE = ["nahuatl", "mexicano", "otra lengua", "no entiendo", "no se leer", "no leo", "audio", "nota de voz", "hablar en"];
const WHO = ["quien eres", "quien es", "eres robot", "eres un robot", "eres persona", "eres humano", "que eres", "inteligencia artificial"];
const UNSUBSCRIBE = ["baja", "dejar de recibir", "ya no quiero", "borrar mis datos", "no me manden", "cancelar avisos"];
const ADD_FAMILY = ["agregar", "otro numero", "mi hijo", "mi hija", "mi hermano", "mi hermana", "otro familiar", "tambien le avisen", "compartir"];
const LOST = ["perdi", "no tengo el folio", "no tengo la tarjeta", "se me olvido el folio", "cual es mi folio", "mi folio"];
const COMPLAINT = ["queja", "me trataron mal", "maltrato", "grosero", "denuncia", "me cobraron", "mordida"];
const ARRIVED = ["ya llegue", "ya estoy aqui", "estoy en informes", "ya vine", "voy para alla", "voy en camino", "ya voy"];
const YES = ["si", "si por favor", "por favor", "claro", "ok", "va", "sale", "esta bien", "bueno", "dale"];
const NO = ["no", "no gracias", "asi esta bien", "nada"];

function lastAgentText(state: DemoState) {
  for (let i = state.messages.length - 1; i >= 0; i--) {
    const m = state.messages[i];
    if (m.from === "service" && m.kind === "agent") return norm(m.text);
  }
  return "";
}

const reportText = (s: DemoState) => (s.nextReport ? `a las ${s.nextReport}` : "en cuanto el hospital lo programe; le aviso aquí la hora");

function statusLine(s: DemoState) {
  const st = statusByCode(s.status);
  const stage = STAGES.find((x) => x.stage === s.stage);
  return `Último aviso del hospital: ${st.es} Etapa: ${stage?.es ?? "en proceso"}. Próximo informe médico ${reportText(s)}.`;
}

export const isClinical = (question: string) => {
  const q = norm(question);
  if (has(q, DONORS)) return false;
  return has(q, CLINICAL) || has(q, SELF_EMERGENCY);
};

export function fixedAnswer(question: string, state: DemoState): string {
  const q = norm(question);
  const report = reportText(state);
  const albergue = PLACES.find((x) => x.type === "albergue")!;
  const comedor = PLACES.find((x) => x.type === "comedor")!;
  const farmacia = PLACES.find((x) => x.type === "farmacia")!;
  const hasDonors = state.pendings.some((p) => p.code === "P03");
  const prev = lastAgentText(state);

  // 0. Vacío o ilegible
  if (q.length === 0 || /^[^a-z0-9]+$/.test(q)) {
    return "¿En qué le puedo ayudar? Puede preguntarme cómo va su paciente, dónde comer o dormir, o pedir hablar con una persona. También puede mandar una nota de voz.";
  }

  // 1. Seguridad primero: la persona que escribe se siente mal
  if (has(q, SELF_EMERGENCY)) {
    return "Si usted se siente mal, vaya ahora mismo a la entrada de urgencias y diga que es una emergencia, o llame al 911. Su salud también importa.";
  }

  // 2. Respuestas cortas a la última pregunta del asistente
  if (isWord(q, YES)) {
    if (prev.includes("reenviar")) {
      return `Mensaje para reenviar:\n"Hola, mi familiar está en ${HOSPITAL.name} y necesita donadores de sangre. Si tienes entre 18 y 65 años y estás sano, ¿puedes ir al banco de sangre del hospital con tu identificación y dar el folio ${ADMISSION.folio}? Gracias."`;
    }
    if (prev.includes("15 minutos")) return `Listo. Le aviso aquí 15 minutos antes del informe ${report}.`;
    if (prev.includes("voluntaria")) return "Listo, ya le avisé. Una voluntaria le escribirá aquí en unos minutos.";
    return "Con gusto. ¿Qué más necesita? Puedo decirle cómo va su paciente, qué trámites tiene o dónde comer y dormir.";
  }
  if (isWord(q, NO)) return "Está bien. Aquí sigo; le aviso en cuanto el hospital publique algo.";

  // 3. Saludos y agradecimientos
  if (isWord(q, THANKS) || (has(q, THANKS) && q.split(" ").length <= 4)) {
    return "Con gusto. Descanse si puede; le aviso aquí de cualquier cambio.";
  }
  if (has(q, GREETING) && q.split(" ").length <= 4) {
    return `Hola, ${ADMISSION.contactName}. ${statusLine(state)} ¿En qué más le ayudo?`;
  }

  // 4. Donadores (antes que lo clínico, porque dice "sangre")
  if (has(q, DONORS)) {
    if (hasDonors) {
      return `Para ${pendingByCode("P03").es.toLowerCase()}: pida a 2 personas sanas, de 18 a 65 años, que vayan con identificación al banco de sangre de este hospital (horario de ejemplo: 7:00 a 10:00) y den el folio ${ADMISSION.folio}. ¿Quiere que le prepare un mensaje para reenviar?`;
    }
    return "Por ahora el hospital no ha pedido donadores para su paciente. Si los necesitan, le aviso aquí con los pasos.";
  }

  // 5. Clínico: nunca se responde por aquí
  if (has(q, CLINICAL)) {
    return `Eso se lo informa el médico en persona. El próximo informe es ${report}. Si quiere, le aviso cuando falten 15 minutos.`;
  }

  // 6. Emociones: acompañar y ofrecer una persona
  if (has(q, EMOTION)) {
    return `Es normal sentirse así. No está sola: puedo comunicarle con una voluntaria que habla español y náhuatl. Mientras, en la pestaña Hoy puede respirar un momento. El próximo informe es ${report}.`;
  }

  // 7. Llegada / confirmación
  if (has(q, ARRIVED)) {
    return state.call.state === "idle"
      ? "Gracias. Por ahora nadie le está llamando; le aviso aquí si le necesitan."
      : "Gracias, ya avisé al módulo de informes que va en camino. Pregunte por el folio " + ADMISSION.folio + ".";
  }

  // 8. Quién soy / lengua / baja / familiares / folio / quejas
  if (has(q, WHO)) {
    return `Soy ${SERVICE_NAME}, un asistente automático. Solo le digo lo que el hospital publica. Si prefiere, le comunico con una persona.`;
  }
  if (has(q, LANGUAGE)) {
    return "Puede mandarme una nota de voz en náhuatl o en español. Los avisos del hospital le llegan con audio en náhuatl. Si quiere, una voluntaria que habla náhuatl le llama.";
  }
  if (q === "baja") {
    return `Listo, su número ya no recibirá avisos del folio ${ADMISSION.folio}. Si fue un error, vuelva a escanear su tarjeta.`;
  }
  if (has(q, UNSUBSCRIBE)) {
    return "Si ya no quiere recibir avisos, escriba BAJA y su número se desvincula. Sus datos se borran 30 días después del alta.";
  }
  if (has(q, ADD_FAMILY)) {
    return "Puede agregar hasta 2 familiares más. Le mando un enlace para que lo compartan; cada uno tendrá que aceptar el aviso de privacidad.";
  }
  if (has(q, LOST)) {
    return `Su folio es ${ADMISSION.folio}. Si perdió la tarjeta, en el módulo de informes se la reponen con su identificación.`;
  }
  if (has(q, COMPLAINT)) {
    return "Lamento lo que pasó. Puede presentar su queja en el módulo de atención al usuario de planta baja (dato de ejemplo). Nadie debe cobrarle por informes ni por pasar a ver a su paciente. ¿Quiere que le comunique con una voluntaria?";
  }

  // 9. Visitas y tiempos
  if (has(q, VISIT)) {
    return state.status === "E09"
      ? "Sí, ya puede pasar un familiar a ver a su paciente. Preséntese en informes con su folio."
      : "Todavía no hay pase de visita. Le aviso aquí en cuanto pueda pasar un familiar.";
  }
  if (has(q, WHEN)) {
    return `No puedo calcular tiempos de atención; solo le digo lo que el hospital publica. El próximo informe médico es ${report}. Le aviso aquí apenas haya un cambio.`;
  }

  // 10. Estado
  if (has(q, STATUS)) return statusLine(state);

  // 11. Trámites y documentos
  if (has(q, DOCUMENTS)) {
    return "Para el ingreso suelen pedir: identificación del paciente o de usted, CURP y comprobante de domicilio. Si no los tiene, no se preocupe: no le negarán la atención. (Lista de ejemplo)";
  }
  if (has(q, PROCEDURES)) {
    if (hasDonors) {
      return `Tiene 1 pendiente: ${pendingByCode("P03").es.toLowerCase()}. Pida a 2 personas sanas, de 18 a 65 años, que vayan con identificación al banco de sangre (horario de ejemplo: 7:00 a 10:00) y den el folio ${ADMISSION.folio}. ¿Quiere que le prepare un mensaje para reenviar?`;
    }
    if (state.pendings.length > 0) {
      return `Tiene pendiente: ${state.pendings.map((p) => pendingByCode(p.code).es.toLowerCase()).join(", ")}.`;
    }
    return "Por ahora no hay trámites pendientes para usted. Si el hospital necesita algo, le aviso aquí.";
  }

  // 12. Lugares y servicios
  if (has(q, PHARMACY)) return `${farmacia.name}: ${farmacia.walk}. ${farmacia.hours}.`;
  if (has(q, SLEEP)) {
    return `${albergue.name}: ${albergue.walk}. ${albergue.hours}, ${albergue.cost.toLowerCase()}. Tenía ${albergue.beds} camas libres a las ${albergue.bedsReportedAt}. Le avisaré aquí si su paciente la necesita.`;
  }
  if (has(q, FOOD)) return `${comedor.name}: ${comedor.walk}. ${comedor.hours}. ${comedor.cost}. Hay agua potable gratis en la sala de espera (dato de ejemplo).`;
  if (has(q, BATHROOM)) return "Hay baños públicos gratuitos en planta baja, junto a la entrada de urgencias (dato de ejemplo).";
  if (has(q, CHARGE)) return "Puede cargar su teléfono gratis en el punto de carga de la sala de espera (dato de ejemplo). Lleve su cable si puede.";
  if (has(q, MONEY)) return "La atención en este hospital es gratuita. No pague a nadie por informes, por turno ni por pasar a ver a su paciente.";
  if (has(q, DIRECTIONS)) return `${HOSPITAL.name}. Entrada de urgencias por la calle lateral (dirección de ejemplo). Pregunte en informes por el folio ${ADMISSION.folio}.`;

  // 13. Persona (al final para no capturar "una persona sana" de otros temas)
  if (has(q, PERSON)) {
    return "Le comunico con una voluntaria de Painani. Le escribirá aquí en unos minutos; habla español y náhuatl.";
  }

  // 14. Fuera de tema
  return `Eso no lo sé responder. Soy ${SERVICE_NAME}, el asistente de ${HOSPITAL.name}: puedo decirle cómo va su paciente, qué trámites tiene, dónde comer, dormir o cargar su teléfono, o comunicarle con una persona.`;
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
