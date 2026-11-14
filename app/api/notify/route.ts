// POST /api/notify — aviso real por WhatsApp (sandbox de Twilio) — carril B, tarea B2.
// Body: { code: "E07" }  →  { sent, sid?, reason? }
//
// Solo acepta avisos críticos del catálogo (E07, E08) y manda el texto validado tal cual:
// nunca texto libre ni información clínica. Responde 200 aunque no se envíe:
// la pantalla no espera esta respuesta y el escalamiento simulado corre igual.

import { NextResponse } from "next/server";
import { ADMISSION, STATUSES } from "@/data/demo";
import { sendWhatsApp } from "@/lib/server/twilio";

export async function POST(req: Request) {
  let body: { code?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const status = STATUSES.find((s) => s.code === body.code && s.critical);
  if (!status) {
    return NextResponse.json({ error: "Solo se envían avisos críticos del catálogo (E07, E08)." }, { status: 400 });
  }

  const result = await sendWhatsApp(
    `Sala Tranquila · Folio ${ADMISSION.folio}\n${status.es}\n\nResponda "Voy" cuando venga en camino.`,
  );
  if (!result.sent && result.reason === "twilio_error") console.error("[notify] Twilio falló:", result.detail);
  return NextResponse.json(result);
}
