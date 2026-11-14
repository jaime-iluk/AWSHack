// Agente de Painani con Amazon Bedrock (Converse API + tool calling).
// Si no hay credenciales, si DEMO_OFFLINE=1 o si el modelo falla, responde con las respuestas fijas.
import {
  BedrockRuntimeClient,
  ConverseCommand,
  type ContentBlock,
  type Message,
  type Tool,
} from "@aws-sdk/client-bedrock-runtime";
import { ADMISSION, HOSPITAL, PLACES, SERVICE_NAME, pendingByCode, statusByCode } from "@/data/demo";
import { fixedAnswer, isClinical } from "@/lib/agent";
import type { DemoState } from "@/lib/reducer";

const MODEL_ID = process.env.BEDROCK_MODEL_ID ?? "us.anthropic.claude-haiku-4-5-20251001-v1:0";
const REGION = process.env.AWS_REGION ?? "us-east-1";

const SYSTEM = `Eres ${SERVICE_NAME}, el asistente automático de ${HOSPITAL.name} para las familias de pacientes de ${HOSPITAL.area}.
Hablas con ${ADMISSION.contactName}, familiar del folio ${ADMISSION.folio}.
Reglas que nunca rompes:
- Solo comunicas lo que el hospital publicó. Usa las herramientas; nunca inventes ni estimes estados, tiempos ni resultados.
- Cero información clínica: no diagnósticos, pronósticos, medicamentos ni gravedad. Si te preguntan algo clínico, di que eso lo informa el médico en persona y da la hora del próximo informe.
- Solo temas de la estancia en el hospital: estado del paciente, pendientes, trámites, lugares cercanos para comer o dormir, hablar con una persona. Si preguntan otra cosa, redirige con amabilidad.
- Frases cortas, de "usted", sin siglas ni tecnicismos. Máximo 3 frases.
- Si la persona pide hablar con alguien, ofrece una voluntaria de ${SERVICE_NAME}.`;

const TOOLS: Tool[] = [
  {
    toolSpec: {
      name: "consultar_estado",
      description: "Último estado publicado por el hospital, etapa, hora del próximo informe y pendientes de la familia.",
      inputSchema: { json: { type: "object", properties: {} } },
    },
  },
  {
    toolSpec: {
      name: "buscar_lugares",
      description: "Lugares cercanos verificados (albergue, comedor, farmacia) con distancia a pie, horario, costo y camas libres.",
      inputSchema: {
        json: {
          type: "object",
          properties: { tipo: { type: "string", enum: ["albergue", "comedor", "farmacia"] } },
        },
      },
    },
  },
  {
    toolSpec: {
      name: "guia_tramite",
      description: "Pasos del trámite pendiente para la familia (por ejemplo, conseguir donadores de sangre).",
      inputSchema: { json: { type: "object", properties: {} } },
    },
  },
];

function runTool(name: string, input: Record<string, unknown>, state: DemoState) {
  switch (name) {
    case "consultar_estado":
      return {
        estado: statusByCode(state.status).es,
        etapa: state.stage,
        proximo_informe: state.nextReport ?? "por confirmar",
        pendientes: state.pendings.map((p) => pendingByCode(p.code).es),
      };
    case "buscar_lugares": {
      const tipo = typeof input.tipo === "string" ? input.tipo : undefined;
      return { lugares: PLACES.filter((p) => !tipo || p.type === tipo) };
    }
    case "guia_tramite":
      return { guia: fixedAnswer("trámite", state) };
    default:
      return { error: "herramienta desconocida" };
  }
}

async function askBedrock(question: string, state: DemoState): Promise<string> {
  const client = new BedrockRuntimeClient({ region: REGION });
  const messages: Message[] = [{ role: "user", content: [{ text: question }] }];

  for (let turn = 0; turn < 4; turn++) {
    const res = await client.send(
      new ConverseCommand({
        modelId: MODEL_ID,
        system: [{ text: SYSTEM }],
        messages,
        toolConfig: { tools: TOOLS },
        inferenceConfig: { temperature: 0.2, maxTokens: 300 },
      }),
    );
    const out = res.output?.message;
    if (!out) break;
    messages.push(out);

    if (res.stopReason !== "tool_use") {
      const text = (out.content ?? []).map((c) => c.text ?? "").join("").trim();
      if (text) return text;
      break;
    }

    const results: ContentBlock[] = (out.content ?? [])
      .filter((c) => c.toolUse)
      .map((c) => ({
        toolResult: {
          toolUseId: c.toolUse!.toolUseId!,
          content: [{ json: JSON.parse(JSON.stringify(runTool(c.toolUse!.name!, (c.toolUse!.input ?? {}) as Record<string, unknown>, state))) }],
        },
      }));
    messages.push({ role: "user", content: results });
  }
  throw new Error("Sin respuesta del modelo");
}

export async function POST(req: Request) {
  const { question, state } = (await req.json()) as { question: string; state: DemoState };

  // Guardrail antes del modelo: lo clínico nunca pasa al LLM.
  if (isClinical(question)) {
    return Response.json({ answer: fixedAnswer(question, state), source: "guardrail" });
  }

  const offline = process.env.DEMO_OFFLINE === "1" || !(process.env.AWS_ACCESS_KEY_ID || process.env.AWS_PROFILE);
  if (offline) {
    return Response.json({ answer: fixedAnswer(question, state), source: "fallback" });
  }

  try {
    const answer = await askBedrock(question, state);
    return Response.json({ answer, source: "bedrock" });
  } catch (err) {
    console.error("[agent] Bedrock falló, uso respuesta fija:", err instanceof Error ? err.message : err);
    return Response.json({ answer: fixedAnswer(question, state), source: "fallback" });
  }
}
