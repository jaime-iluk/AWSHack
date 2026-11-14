// POST /api/agent — agente real (carril B, tarea B1).
// Body: { text: string, state?: { status, stage, nextReport, pendings } }  →  { reply, source }
// Nunca deja al teléfono sin respuesta: si algo falla responde con fixedAnswer().

import { NextResponse } from "next/server";
import { answer } from "@/lib/server/agent";
import { normalizeContext, type AgentRequest } from "@/lib/server/context";

export async function POST(req: Request) {
  let body: AgentRequest;
  try {
    body = (await req.json()) as AgentRequest;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim().slice(0, 500) : "";
  if (!text) return NextResponse.json({ error: 'Falta "text"' }, { status: 400 });

  return NextResponse.json(await answer(text, normalizeContext(body.state)));
}
