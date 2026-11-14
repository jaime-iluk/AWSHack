// Orquestación del agente real (carril B, tarea B1):
// guardrail clínico → Bedrock (si hay credenciales) → revisión de salida → respaldo fijo (fixedAnswer).

import { fixedAnswer } from "@/lib/agent";
import { askBedrock, hasAwsCredentials } from "./bedrock";
import { toDemoState, type AgentContext, type AgentResponse } from "./context";
import { clinicalReply, isClinicalQuestion, looksClinicalAnswer } from "./guardrail";

export const isOffline = () => process.env.DEMO_OFFLINE === "1";

export async function answer(
  question: string,
  ctx: AgentContext,
  ask: (q: string, c: AgentContext) => Promise<string> = askBedrock,
): Promise<AgentResponse> {
  // 1. Lo clínico nunca llega al LLM.
  if (isClinicalQuestion(question)) {
    return { reply: clinicalReply(ctx.nextReport), source: "guardrail" };
  }

  // 2. Sin red o sin credenciales: respuestas fijas del carril A.
  if (isOffline() || !hasAwsCredentials()) {
    return { reply: fixedAnswer(question, toDemoState(ctx)), source: "fallback" };
  }

  // 3. LLM real, con revisión de salida y respaldo si falla.
  try {
    const reply = await ask(question, ctx);
    if (looksClinicalAnswer(reply)) {
      return { reply: clinicalReply(ctx.nextReport), source: "guardrail" };
    }
    return { reply, source: "bedrock" };
  } catch (err) {
    console.error("[agent] Bedrock falló, uso respuesta fija:", err instanceof Error ? err.message : err);
    return { reply: fixedAnswer(question, toDemoState(ctx)), source: "fallback" };
  }
}
