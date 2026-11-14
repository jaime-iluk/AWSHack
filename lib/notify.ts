// Cliente del aviso real (carril B, tarea B2). Fire-and-forget: la demo nunca lo espera.
// Integración (últimos 15 min): en lib/useDemo.ts → press(), si id === "E07" llamar sendRealNotice("E07").

export function sendRealNotice(code: "E07" | "E08"): void {
  if (process.env.NEXT_PUBLIC_DEMO_OFFLINE === "1") return;
  fetch("/api/notify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  })
    .then((r) => r.json())
    .then((r) => console.info("[notify]", r))
    .catch(() => {
      /* sin red: la demo sigue con el escalamiento simulado */
    });
}
