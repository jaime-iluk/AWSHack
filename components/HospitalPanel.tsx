"use client";
// Panel del hospital (modo Operate): una acción = un toque, estado de cada aviso siempre visible.
import { ADMISSION, DEMO_BUTTONS, HOSPITAL, statusByCode, type DemoButtonId } from "@/data/demo";
import type { DemoState } from "@/lib/reducer";
import { fmtElapsed, fmtTime } from "@/lib/useDemo";
import { Check, Mensaje, Reiniciar, Telefono } from "./Icons";

function isPublished(id: DemoButtonId, s: DemoState) {
  if (id === "B01") return s.nextReport !== null;
  if (id === "E08") return s.pendings.some((p) => p.code === "P03");
  if (id === "E07") return s.call.state !== "idle";
  return s.status === id || (id === "E02" && s.stage >= 2);
}

const STEPS = [
  { key: "wa", label: "WhatsApp enviado", icon: Mensaje },
  { key: "sms", label: "Sin lectura: SMS enviado", icon: Mensaje },
  { key: "call", label: "Llamada con audio en náhuatl", icon: Telefono },
  { key: "coming", label: "Rosa confirmó: va en camino", icon: Check },
] as const;

function stepState(i: number, call: DemoState["call"]): "done" | "now" | "skip" | "todo" {
  if (call.state === "coming") {
    // Solo se muestran los escalamientos que sí ocurrieron antes de la confirmación.
    const reachedSms = call.escalated === "sms" || call.escalated === "call";
    const reachedCall = call.escalated === "call";
    if (i === 1) return reachedSms ? "done" : "skip";
    if (i === 2) return reachedCall ? "done" : "skip";
    return "done";
  }
  const reached = { idle: -1, waiting: 0, sms_sent: 1, calling: 2 }[call.state];
  if (i < reached) return "done";
  if (i === reached) return "now";
  return "todo";
}

export function HospitalPanel({ state, onPress, onReset }: { state: DemoState; onPress: (id: DemoButtonId) => void; onReset: () => void }) {
  const s = statusByCode(state.status);
  const call = state.call;

  return (
    <section aria-labelledby="panel-title" className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto rounded-3xl bg-white p-5 shadow-[0_1px_2px_rgba(16,23,58,0.06),0_8px_24px_-12px_rgba(16,23,58,0.18)]">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 id="panel-title" className="text-xl font-bold text-anil-950">{HOSPITAL.area}</h2>
          <p className="text-sm text-tinta-muted">Panel del personal, {HOSPITAL.name}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <p className="rounded-full bg-anil-50 px-3 py-1 text-sm font-bold text-anil-700 tabular" translate="no">
            {ADMISSION.folio}
          </p>
          <button
            type="button"
            onClick={onReset}
            aria-label="Reiniciar demo"
            title="Reiniciar demo"
            className="grid size-11 place-items-center rounded-full text-tinta-muted transition-colors duration-200 hover:bg-cal hover:text-anil-950"
          >
            <Reiniciar width={18} height={18} />
          </button>
        </div>
      </header>

      <div className="border-y border-cal-200 py-3">
        <p className="text-sm text-tinta-muted">
          Último estado publicado, <span className="tabular">{fmtTime(state.lastChangeAt)}</span>
        </p>
        <p className="mt-1 text-base leading-snug text-anil-950 text-pretty">{s.es}</p>
        <p className="mt-1 text-sm text-tinta-muted">Lo recibe {ADMISSION.contactName}, que habla náhuatl.</p>
      </div>

      <div className="flex flex-col gap-2" role="group" aria-label="Publicar un aviso">
        {DEMO_BUTTONS.map((b) => {
          const done = isPublished(b.id, state);
          const critical = b.id === "E07" || b.id === "E08";
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => onPress(b.id)}
              className={`group flex items-center justify-between gap-4 rounded-2xl border-2 px-4 py-2.5 text-left transition-[background-color,border-color,transform] duration-200 active:scale-[0.99] ${
                done
                  ? "border-jade-600 bg-jade-100"
                  : critical
                    ? "border-ambar-100 bg-white hover:border-ambar-600 hover:bg-ambar-100/50"
                    : "border-anil-100 bg-white hover:border-anil-500 hover:bg-anil-50"
              }`}
            >
              <span className="min-w-0">
                <span className="block text-sm text-tinta-muted">{b.role}</span>
                <span className="block text-lg font-bold text-anil-950">{b.label}</span>
              </span>
              {done ? (
                <span className="flex shrink-0 items-center gap-1 text-sm font-bold text-jade-700">
                  <Check /> Enviado
                </span>
              ) : (
                <span className="shrink-0 text-sm font-bold text-anil-700 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                  Publicar
                </span>
              )}
            </button>
          );
        })}
      </div>

      {call.state !== "idle" && (
        <div aria-live="polite" className="rounded-2xl bg-anil-50 px-4 py-3">
          <h3 className="font-bold text-anil-950">Aviso urgente a {ADMISSION.contactName}</h3>
          <ol className="mt-2 flex flex-col gap-1.5">
            {STEPS.map((step, i) => {
              const st = stepState(i, call);
              if (st === "skip") return null;
              const Icon = step.icon;
              return (
                <li
                  key={step.key}
                  className={`flex items-center gap-3 text-sm ${
                    st === "done" ? "text-jade-700" : st === "now" ? "font-bold text-ambar-800" : "text-tinta-muted/70"
                  }`}
                >
                  <Icon className={st === "now" && i === 2 ? "timbre" : undefined} />
                  <span>
                    {step.label}
                    {i === 3 && st === "done" && (
                      <span className="tabular"> en {fmtElapsed(call.startedAt, call.confirmedAt)}</span>
                    )}
                    {st === "now" && i < 3 && "…"}
                  </span>
                </li>
              );
            })}
          </ol>
          {call.state === "coming" && (
            <p className="mt-2 text-sm font-bold text-jade-700">Familiar en camino a informes.</p>
          )}
        </div>
      )}

    </section>
  );
}
