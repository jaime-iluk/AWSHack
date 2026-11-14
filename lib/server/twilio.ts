// Envío real por el sandbox de WhatsApp de Twilio (carril B, tarea B2).
// Solo para la demo: un celular del equipo recibe el aviso E07 frente a los jueces.
// El escalamiento (SMS, llamada) sigue simulado en pantalla.

export interface SendResult {
  sent: boolean
  sid?: string
  reason?: 'offline' | 'not_configured' | 'twilio_error' | 'timeout'
  detail?: string
}

const TIMEOUT_MS = 6000

function config() {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  // Número del sandbox de WhatsApp de Twilio, p. ej. "whatsapp:+14155238886".
  const from = process.env.TWILIO_FROM
  // Celular del equipo que ya se unió al sandbox, p. ej. "whatsapp:+5215512345678".
  const to = process.env.NOTIFY_TO
  if (!sid || !token || !from || !to) return null
  const wa = (n: string) => (n.startsWith('whatsapp:') ? n : `whatsapp:${n}`)
  return { sid, token, from: wa(from), to: wa(to) }
}

export function isTwilioConfigured(): boolean {
  return config() !== null
}

export async function sendWhatsApp(body: string, fetchImpl: typeof fetch = fetch): Promise<SendResult> {
  if (process.env.DEMO_OFFLINE === '1') return { sent: false, reason: 'offline' }
  const cfg = config()
  if (!cfg) return { sent: false, reason: 'not_configured' }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(cfg.sid)}/Messages.json`
  const auth = Buffer.from(`${cfg.sid}:${cfg.token}`).toString('base64')

  try {
    const res = await fetchImpl(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ From: cfg.from, To: cfg.to, Body: body }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    const data = (await res.json().catch(() => ({}))) as { sid?: string; message?: string; code?: number }
    if (!res.ok) {
      return { sent: false, reason: 'twilio_error', detail: `${res.status} ${data.code ?? ''} ${data.message ?? ''}`.trim() }
    }
    return { sent: true, sid: data.sid }
  } catch (err) {
    const timeout = err instanceof Error && err.name === 'TimeoutError'
    return { sent: false, reason: timeout ? 'timeout' : 'twilio_error', detail: err instanceof Error ? err.message : String(err) }
  }
}
