// Guardrail clínico: corre ANTES y DESPUÉS del LLM.
// Regla de producto: cero información clínica; eso lo informa el médico en persona.

const normalize = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

// Preguntas de la familia sobre temas clínicos.
const CLINICAL_QUESTION = [
  /\bque tiene\b/,
  /\bdiagnostic/,
  /\bmedicin/,
  /\bmedicament/,
  /\bgrave\b/,
  /\bpronostic/,
  /\bse va a (morir|salvar|curar)/,
  /\b(va|vaya) a (vivir|morir)/,
  /\benfermedad\b/,
  /\bresultad/,
  /\banalisis\b/,
  /\btriage\b/,
  /\bdosis\b/,
  /\boperacion (salio|fue)/,
  /\bcancer\b/,
  /\binfart/,
]

// Señales de que una respuesta del LLM se salió del catálogo hacia lo clínico.
const CLINICAL_ANSWER = [
  /\bdiagnostic/,
  /\bmedicament/,
  /\bdosis\b/,
  /\bpronostic/,
  /\b(esta|se encuentra) (grave|estable|critic)/,
  /\bcolor (rojo|amarillo|verde|naranja) de triage/,
  /\btriage\b/,
]

export function isClinicalQuestion(text: string): boolean {
  const t = normalize(text)
  return CLINICAL_QUESTION.some((r) => r.test(t))
}

export function looksClinicalAnswer(text: string): boolean {
  const t = normalize(text)
  return CLINICAL_ANSWER.some((r) => r.test(t))
}

export function clinicalReply(nextReport: string | null): string {
  return nextReport
    ? `Eso se lo informa el médico en persona. El próximo informe es a las ${nextReport}.`
    : 'Eso se lo informa el médico en persona. Le avisaremos la hora del próximo informe.'
}
