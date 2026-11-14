// Aviso real por el sandbox de WhatsApp de Twilio (solo el texto del catálogo, nunca información clínica).
// Sin credenciales o con DEMO_OFFLINE=1 no envía nada y la demo sigue simulada en pantalla.
import { SERVICE_NAME, statusByCode, type StatusCode } from "@/data/demo";

export async function POST(req: Request) {
  const { code } = (await req.json()) as { code: StatusCode };
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM; // p. ej. whatsapp:+14155238886 (sandbox)
  const to = process.env.DEMO_PHONE_TO; // p. ej. whatsapp:+52155XXXXXXXX (unido al sandbox)

  if (process.env.DEMO_OFFLINE === "1" || !sid || !token || !from || !to) {
    return Response.json({ sent: false, reason: "sin credenciales o modo sin conexión" });
  }

  const body = `${SERVICE_NAME}: ${statusByCode(code).es}`;
  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ From: from, To: to, Body: body }),
    });
    if (!res.ok) {
      console.error("[notify] Twilio respondió", res.status, await res.text());
      return Response.json({ sent: false, reason: `Twilio ${res.status}` });
    }
    return Response.json({ sent: true });
  } catch (err) {
    console.error("[notify] error:", err instanceof Error ? err.message : err);
    return Response.json({ sent: false, reason: "error de red" });
  }
}
