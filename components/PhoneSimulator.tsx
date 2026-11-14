"use client";
// Teléfono de Rosa: simulación del canal de WhatsApp. Es el centro de la demo.
import { useEffect, useRef, useState } from "react";
import { ADMISSION, SERVICE_NAME, SUGGESTED_QUESTIONS } from "@/data/demo";
import type { DemoState, PhoneMessage } from "@/lib/reducer";
import { fmtTime } from "@/lib/useDemo";
import { Enviar, Marca, Play, Telefono } from "./Icons";

function playAudio(src?: string) {
  if (!src) return;
  new Audio(src).play().catch(() => {
    /* El audio aún no está grabado: la demo sigue sin sonido. */
  });
}

function Bubble({ m }: { m: PhoneMessage }) {
  if (m.kind === "sms") {
    return (
      <li className="llega self-center max-w-[90%] rounded-2xl bg-anil-950/85 px-4 py-2 text-center text-sm text-white">
        <span className="block text-xs font-bold text-anil-100">Mensaje SMS</span>
        {m.text.replace(/^SMS:\s*/, "")}
      </li>
    );
  }
  const mine = m.from === "family";
  return (
    <li
      className={`llega max-w-[86%] rounded-2xl px-4 py-3 text-[15px] leading-snug shadow-[0_1px_1px_rgba(16,23,58,0.08)] ${
        mine
          ? "self-end rounded-br-md bg-anil-700 text-white"
          : m.critical
            ? "self-start rounded-bl-md bg-ambar-100 text-ambar-800"
            : "self-start rounded-bl-md bg-white text-anil-950"
      }`}
    >
      {m.critical && !mine && <span className="mb-1 block text-xs font-bold">Le necesitamos</span>}
      <p className="text-pretty">{m.text}</p>
      {m.nah && <p className={`mt-1 text-xs italic ${m.critical ? "text-ambar-800/80" : "text-tinta-muted"}`}>{m.nah}</p>}
      {m.audio && (
        <button
          type="button"
          onClick={() => playAudio(m.audio)}
          aria-label="Escuchar el aviso en náhuatl"
          className="mt-2 flex items-center gap-2 rounded-full bg-anil-50 py-1.5 pl-2 pr-3 text-xs font-bold text-anil-700 transition-colors duration-200 hover:bg-anil-100"
        >
          <Play width={14} height={14} /> Escuchar en náhuatl
        </button>
      )}
      <p className={`mt-1 text-right text-[11px] tabular ${mine ? "text-anil-100" : "text-tinta-muted"}`}>{fmtTime(m.at)}</p>
    </li>
  );
}

export function PhoneSimulator({ state, onAsk, onConfirm }: { state: DemoState; onAsk: (t: string) => void; onConfirm: () => void }) {
  const [text, setText] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const awaiting = state.call.state === "waiting" || state.call.state === "sms_sent" || state.call.state === "calling";

  const answerRef = useRef<HTMLButtonElement>(null);
  const calling = state.call.state === "calling";

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ top: el.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [state.messages.length, state.agentTyping, awaiting]);

  // La llamada entrante toma el foco para que se pueda contestar con teclado.
  useEffect(() => {
    if (calling) answerRef.current?.focus();
  }, [calling]);

  const send = (t: string) => {
    if (!t.trim()) return;
    onAsk(t);
    setText("");
  };

  return (
    <div className="flex h-full min-h-0 flex-col items-center gap-3">
      <section
        aria-label={`Teléfono de ${ADMISSION.contactName}`}
        className="relative flex min-h-0 w-full max-w-[400px] flex-1 flex-col overflow-hidden rounded-[44px] border-[10px] border-anil-950 bg-cal-200 shadow-[0_24px_48px_-20px_rgba(16,23,58,0.45)]"
      >
        <header className="flex items-center gap-3 bg-anil-700 px-4 pb-3 pt-4 text-white">
          <span className="grid size-10 place-items-center rounded-full bg-white text-anil-700">
            <Marca width={26} height={26} />
          </span>
          <div className="min-w-0">
            <p className="text-lg font-bold leading-tight">{SERVICE_NAME}</p>
            <p className="text-xs text-anil-100">Asistente automático del hospital</p>
          </div>
        </header>

        <div ref={listRef} className="chat-scroll min-h-0 flex-1 overflow-y-auto px-3 py-4">
          <ol aria-live="polite" className="flex flex-col gap-2.5">
            {state.messages.map((m) => (
              <Bubble key={m.id} m={m} />
            ))}
            {state.agentTyping && (
              <li className="llega self-start rounded-2xl rounded-bl-md bg-white px-4 py-3 text-sm text-tinta-muted">Escribiendo…</li>
            )}
          </ol>
        </div>

        {awaiting && (
          <button
            type="button"
            onClick={onConfirm}
            className="mx-3 mb-2 rounded-full bg-jade-600 py-3.5 text-lg font-bold text-white transition-colors duration-200 hover:bg-jade-700"
          >
            Voy en camino
          </button>
        )}

        <div className="flex gap-2 overflow-x-auto px-3 pb-2">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => send(q)}
              className="shrink-0 rounded-full border border-anil-100 bg-white px-3 py-1.5 text-sm text-anil-700 transition-colors duration-200 hover:border-anil-500"
            >
              {q}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(text);
          }}
          className="flex items-center gap-2 bg-white p-2.5"
        >
          <label htmlFor="pregunta" className="sr-only">
            Escriba su pregunta
          </label>
          <input
            id="pregunta"
            name="pregunta"
            autoComplete="off"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escriba su pregunta…"
            className="min-w-0 flex-1 rounded-full bg-cal px-4 py-2.5 text-[15px] text-anil-950 placeholder:text-tinta-muted focus-visible:outline-anil-500"
          />
          <button
            type="submit"
            aria-label="Enviar pregunta"
            className="grid size-11 shrink-0 place-items-center rounded-full bg-anil-700 text-white transition-colors duration-200 hover:bg-anil-900"
          >
            <Enviar />
          </button>
        </form>

        {calling && (
          <div role="dialog" aria-modal="true" aria-label="Llamada entrante" className="llega absolute inset-0 flex flex-col items-center justify-between bg-anil-950 px-8 py-14 text-white">
            <div className="flex flex-col items-center gap-3 text-center">
              <p className="text-sm text-anil-100">Llamada entrante</p>
              <p className="text-3xl font-bold">{SERVICE_NAME}</p>
              <p className="text-base text-anil-100 text-pretty">Audio en náhuatl: el médico quiere hablar con usted.</p>
            </div>
            <span className="grid size-24 place-items-center rounded-full bg-white/10">
              <Telefono width={44} height={44} className="timbre" />
            </span>
            <button
              ref={answerRef}
              type="button"
              onClick={onConfirm}
              className="w-full rounded-full bg-jade-600 py-4 text-lg font-bold transition-colors duration-200 hover:bg-jade-700"
            >
              Contestar: voy en camino
            </button>
          </div>
        )}
      </section>
      <p className="text-sm text-tinta-muted">Simulación del WhatsApp de {ADMISSION.contactName}</p>
    </div>
  );
}
