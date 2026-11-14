"use client";
import { useCallback, useEffect, useReducer } from "react";
import { askAgent } from "@/lib/agent";
import { demoReducer, initialState } from "@/lib/reducer";
import type { DemoButtonId, PendingCode } from "@/data/demo";
import { NEXT_REPORT_TIME } from "@/data/demo";

// Tiempos del escalamiento simulado (en producción: 5 y 10 minutos).
export const SMS_AFTER_MS = 4000;
export const CALL_AFTER_MS = 4000; // después del SMS

export function useDemo() {
  const [state, dispatch] = useReducer(demoReducer, initialState);

  // Arranque en el cliente (evita diferencias de hora entre servidor y navegador).
  useEffect(() => {
    dispatch({ type: "RESET", now: Date.now() });
  }, []);

  // Escalamiento E07: WhatsApp → SMS → llamada, se cancela con "Voy en camino".
  useEffect(() => {
    if (state.call.state === "waiting") {
      const t = setTimeout(() => dispatch({ type: "ESCALATE", level: "sms", now: Date.now() }), SMS_AFTER_MS);
      return () => clearTimeout(t);
    }
    if (state.call.state === "sms_sent") {
      const t = setTimeout(() => dispatch({ type: "ESCALATE", level: "call", now: Date.now() }), CALL_AFTER_MS);
      return () => clearTimeout(t);
    }
  }, [state.call.state]);

  const press = useCallback((id: DemoButtonId) => {
    const now = Date.now();
    if (id === "B01") dispatch({ type: "BROADCAST_B01", hora: NEXT_REPORT_TIME, now });
    else if (id === "E08") dispatch({ type: "ADD_PENDING", code: "P03" as PendingCode, now });
    else dispatch({ type: "PUBLISH_STATUS", code: id, now });
    // Aviso crítico: además de la simulación, intenta mandar un WhatsApp real (si hay credenciales).
    if (id === "E07") {
      fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: "E07" }),
      }).catch(() => {
        /* sin red: la demo sigue simulada */
      });
    }
  }, []);

  const confirmComing = useCallback(() => dispatch({ type: "CONFIRM_COMING", now: Date.now() }), []);
  const reset = useCallback(() => dispatch({ type: "RESET", now: Date.now() }), []);

  const ask = useCallback(
    async (text: string) => {
      const q = text.trim();
      if (!q) return;
      dispatch({ type: "FAMILY_MESSAGE", text: q, now: Date.now() });
      const answer = await askAgent(q, state);
      dispatch({ type: "AGENT_REPLY", text: answer, now: Date.now() });
    },
    [state],
  );

  return { state, press, confirmComing, reset, ask };
}

export const fmtTime = (ms: number | null) =>
  ms === null
    ? "—"
    : new Intl.DateTimeFormat("es-MX", { hour: "2-digit", minute: "2-digit", timeZone: "America/Mexico_City" }).format(ms);

export const fmtElapsed = (from?: number, to?: number) => {
  if (!from || !to) return "";
  const s = Math.max(0, Math.round((to - from) / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};
