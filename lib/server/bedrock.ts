// Agente real con Amazon Bedrock (Converse API + tool calling).
// Modelo por defecto: Claude Haiku 5.5 vía perfil de inferencia de EE. UU.

import {
  BedrockRuntimeClient,
  ConverseCommand,
  type ContentBlock,
  type Message,
  type ToolResultContentBlock,
} from '@aws-sdk/client-bedrock-runtime'
import { TOOLS, runTool } from './tools'
import type { AgentContext } from './context'

const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'us.anthropic.claude-haiku-5-5'
const REGION = process.env.AWS_REGION || 'us-east-1'
const TIMEOUT_MS = Number(process.env.AGENT_TIMEOUT_MS || 8000)
const MAX_TOOL_ROUNDS = 3

const SYSTEM_PROMPT = `Eres el asistente automático de Sala Tranquila en un hospital público de la Ciudad de México.
Hablas con la familia de un paciente de urgencias. Responde en español, de "usted", con frases cortas y sencillas, sin siglas ni tecnicismos. Máximo 3 frases.

Reglas que nunca rompes:
- Solo comunicas lo que el hospital publicó. Para el estado del paciente usa SIEMPRE la herramienta consultar_estado y repite su texto; nunca inventes, estimes ni interpretes.
- Cero información clínica: no diagnósticos, no medicamentos, no gravedad, no pronóstico, no color de triage. Si preguntan algo así, di: "Eso se lo informa el médico en persona" y da la hora del próximo informe.
- Las malas noticias nunca se dan por chat.
- Solo temas de la estancia en el hospital: estado del paciente, pendientes, dónde dormir, comer o comprar medicinas cerca (usa buscar_lugares), o hablar con una persona. Si preguntan otra cosa, di amablemente lo que sí puedes hacer.
- Eres un asistente automático: dilo si te preguntan quién eres y ofrece comunicar con una persona.`

let client: BedrockRuntimeClient | null = null
function getClient() {
  client ??= new BedrockRuntimeClient({ region: REGION })
  return client
}

/** Hay alguna forma de credencial de AWS configurada. */
export function hasAwsCredentials(): boolean {
  return Boolean(
    process.env.AWS_ACCESS_KEY_ID || process.env.AWS_PROFILE || process.env.AWS_BEARER_TOKEN_BEDROCK,
  )
}

export async function askBedrock(question: string, ctx: AgentContext): Promise<string> {
  const abort = AbortSignal.timeout(TIMEOUT_MS)
  const messages: Message[] = [{ role: 'user', content: [{ text: question }] }]

  for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
    const res = await getClient().send(
      new ConverseCommand({
        modelId: MODEL_ID,
        system: [{ text: SYSTEM_PROMPT }],
        messages,
        toolConfig: { tools: TOOLS },
        inferenceConfig: { maxTokens: 300 },
      }),
      { abortSignal: abort },
    )

    const output = res.output?.message
    if (!output) throw new Error('Bedrock: respuesta vacía')
    messages.push(output)

    if (res.stopReason !== 'tool_use') {
      const text = (output.content ?? []).map((b) => b.text ?? '').join('').trim()
      if (!text) throw new Error('Bedrock: sin texto')
      return text
    }

    const results: ContentBlock[] = (output.content ?? [])
      .filter((b) => b.toolUse)
      .map(
        (b): ContentBlock.ToolResultMember => ({
          toolResult: {
            toolUseId: b.toolUse!.toolUseId!,
            content: [{ json: runTool(b.toolUse!.name!, b.toolUse!.input, ctx) as ToolResultContentBlock.JsonMember['json'] }],
          },
        }),
      )
    messages.push({ role: 'user', content: results })
  }
  throw new Error('Bedrock: demasiadas llamadas a herramientas')
}
