// Herramientas del agente: SOLO lectura de lo que el hospital ya publicó y de lugares de data/demo.ts.

import type { Tool } from "@aws-sdk/client-bedrock-runtime";
import { PLACES, STAGES, pendingByCode, statusByCode, type Place } from "@/data/demo";
import type { AgentContext } from "./context";

export const TOOLS: Tool[] = [
  {
    toolSpec: {
      name: "consultar_estado",
      description:
        "Devuelve el último estado que el hospital publicó para el paciente (texto validado del catálogo), " +
        "la etapa, la hora del próximo informe y los pendientes de la familia. Úsala para cualquier pregunta sobre cómo va el paciente o qué se necesita.",
      inputSchema: { json: { type: "object", properties: {}, required: [] } },
    },
  },
  {
    toolSpec: {
      name: "buscar_lugares",
      description:
        "Busca lugares verificados cerca del hospital: albergue (para dormir), comedor o farmacia. Devuelve distancia a pie, horario, costo y camas libres si aplica.",
      inputSchema: {
        json: {
          type: "object",
          properties: { tipo: { type: "string", enum: ["albergue", "comedor", "farmacia"] } },
          required: ["tipo"],
        },
      },
    },
  },
];

export function describePlace(p: Place): string {
  const beds = p.beds !== undefined ? ` Camas libres: ${p.beds} (reporte de las ${p.bedsReportedAt}).` : "";
  return `${p.name}: ${p.walk}. ${p.hours}. ${p.cost}.${beds}`;
}

export function runTool(name: string, input: unknown, ctx: AgentContext): Record<string, unknown> {
  if (name === "consultar_estado") {
    return {
      folio: ctx.folio,
      estado: statusByCode(ctx.status).es,
      etapa: STAGES.find((s) => s.stage === ctx.stage)?.es ?? null,
      proximo_informe: ctx.nextReport ?? "Aún no se publica.",
      pendientes: ctx.pendings.length ? ctx.pendings.map((c) => pendingByCode(c).es) : ["Ninguno"],
    };
  }
  if (name === "buscar_lugares") {
    const tipo = (input as { tipo?: unknown } | null)?.tipo;
    const places = PLACES.filter((p) => p.type === tipo).slice(0, 3);
    return { lugares: places.length ? places.map(describePlace) : ["No hay lugares verificados de ese tipo."] };
  }
  return { error: `Herramienta desconocida: ${name}` };
}
