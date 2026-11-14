"use client";
// Carril A: aquí está la magia de la demo. Rediseñar libremente; mantener las props.
import { useState } from "react";
import { SUGGESTED_QUESTIONS } from "@/data/demo";
import type { DemoState } from "@/lib/reducer";
import { fmtTime } from "@/lib/useDemo";

function playAudio(src?: string) {
  if (!src) return;
  new Audio(src).play().catch(() => {
    /* audio aún no grabado: se ignora en la demo */
  });
}

export function PhoneSimulator({ state, onAsk, onConfirm }: { state: DemoState; onAsk: (t: string) => void; onConfirm: () => void }) {
  const [text, setText] = useState("");
  const awaiting = state.call.state === "waiting" || state.call.state === "sms_sent" || state.call.state === "calling";

  const send = (t: string) => {
    onAsk(t);
    setText("");
  };

  return (
    <section className="relative mx-auto flex h-full w-full max-w-[380px] flex-col overflow-hidden rounded-[2.5rem] border-[10px] border-slate-900 bg-[#efeae2] shadow-xl">
      <header className="bg-teal-800 px-4 py-3 text-white">
        <p className="font-semibold">Sala Tranquila</p>
        <p className="text-xs opacity-80">Asistente automático · teléfono de Rosa</p>
      </header>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-3">
        {state.messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[85%] rounded-xl px-3 py-2 text-sm shadow-sm ${
              m.from === "family" ? "self-end bg-[#d9fdd3]" : m.kind === "sms" ? "self-center bg-slate-200 text-slate-700" : "self-start bg-white"
            } ${m.critical ? "ring-2 ring-amber-400" : ""}`}
          >
            <p>{m.text}</p>
            {m.nah && <p className="mt-1 text-xs italic text-slate-500">{m.nah}</p>}
            {m.audio && (
              <button onClick={() => playAudio(m.audio)} className="mt-1 text-xs font-medium text-teal-700">▶ Escuchar en náhuatl</button>
            )}
            <p className="mt-1 text-right text-[10px] text-slate-400">{fmtTime(m.at)}</p>
          </div>
        ))}
        {state.agentTyping && <p className="self-start text-xs text-slate-500">escribiendo…</p>}
      </div>

      {awaiting && (
        <button onClick={onConfirm} className="mx-3 mb-2 rounded-full bg-teal-700 py-3 font-semibold text-white">Voy en camino</button>
      )}

      <div className="flex gap-2 overflow-x-auto px-3 pb-2">
        {SUGGESTED_QUESTIONS.map((q) => (
          <button key={q} onClick={() => send(q)} className="shrink-0 rounded-full bg-white px-3 py-1 text-xs text-teal-800 shadow-sm">{q}</button>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(text);
        }}
        className="flex gap-2 bg-[#f0f0f0] p-2"
      >
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Escriba un mensaje" className="flex-1 rounded-full bg-white px-4 py-2 text-sm outline-none" />
        <button className="rounded-full bg-teal-700 px-4 text-sm text-white">Enviar</button>
      </form>

      {state.call.state === "calling" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-slate-900/95 text-white">
          <p className="text-sm opacity-70">Llamada entrante</p>
          <p className="text-2xl font-semibold">Sala Tranquila</p>
          <p className="px-8 text-center text-sm opacity-80">Aviso en náhuatl: el médico quiere hablar con usted.</p>
          <button onClick={onConfirm} className="rounded-full bg-teal-500 px-6 py-3 font-semibold">Contestar · “Voy en camino”</button>
        </div>
      )}
    </section>
  );
}
