"use client";
// Panel del hospital (tableta del personal): una acción = un toque; estado de cada aviso siempre visible.
import { ADMISSION, DEMO_BUTTONS, HOSPITAL, statusByCode, type DemoButtonId } from "@/data/demo";
import type { DemoState } from "@/lib/reducer";
import { fmtElapsed, fmtTime } from "@/lib/useDemo";
import { Check, Mensaje, Reiniciar, Telefono } from "./Icons";
import { Mini } from "./Illustrations";

function isPublished(id: DemoButtonId, s: DemoState) {
  if (id === "B01") return s.nextReport !== null;
  if (id === "E08") return s.pendings.some((p) => p.code === "P03");
  if (id === "E07") return s.call.state !== "idle";
  return s.status === id || (id === "E02" && s.stage >= 2);
}

const BUTTON_MINI = { E02: "atencion", B01: "registro", E08: "tramite", E07: "persona" } as const;

const STEPS = [
  { key: "wa", label: "WhatsApp enviado", icon: Mensaje },
  { key: "sms", label: "Sin lectura: SMS enviado", icon: Mensaje },
  { key: "call", label: "Llamada con audio en náhuatl", icon: Telefono },
  { key: "coming", label: "Confirmó: va en camino", icon: Check },
] as const;

function stepState(i: number, call: DemoState["call"]): "done" | "now" | "skip" | "todo" {
  if (call.state === "coming") {
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

export function HospitalPanel({
  state,
  onPress,
  onReset,
  linked = true,
}: {
  state: DemoState;
  onPress: (id: DemoButtonId) => void;
  onReset: () => void;
  linked?: boolean;
}) {
  const s = statusByCode(state.status);
  const call = state.call;

  return (
    <section aria-labelledby="panel-title" className="flex h-full min-h-0 flex-col gap-3 overflow-y-auto rounded-[32px] bg-white p-4 shadow-[0_2px_0_#ebe7e1]">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 id="panel-title" className="text-xl font-extrabold">{HOSPITAL.area}</h2>
          <p className="text-sm text-tinta-suave">Tableta del personal</p>
        </div>
        <button
          type="button"
          onClick={onReset}
          aria-label="Reiniciar demo"
          title="Reiniciar demo"
          className="grid size-10 shrink-0 place-items-center rounded-full text-tinta-suave transition-colors duration-200 hover:bg-fondo hover:text-tinta"
        >
          <Reiniciar width={18} height={18} />
        </button>
      </header>

      <div className="rounded-3xl bg-fondo px-4 py-3">
        <div className="flex items-center justify-between">
          <p className="text-2xl font-extrabold tabular" translate="no">
            {ADMISSION.folio}
          </p>
          <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${linked ? "bg-jade-claro text-jade-oscuro" : "bg-maiz-claro text-cafe"}`}>
            {linked ? `${ADMISSION.contactName} vinculada` : "Sin vincular"}
          </span>
        </div>
        <p className="mt-2 text-sm text-tinta-suave">
          Último estado, <span className="tabular">{fmtTime(state.lastChangeAt)}</span>
        </p>
        <p className="font-bold leading-snug text-pretty">{s.es}</p>
        <p className="mt-1 text-xs text-tinta-suave">{linked ? "Recibe en náhuatl por WhatsApp" : "Avisos en espera hasta que la familia vincule su teléfono"}</p>
      </div>

      <div className="flex flex-col gap-2" role="group" aria-label="Publicar un aviso">
        {DEMO_BUTTONS.map((b) => {
          const done = isPublished(b.id, state);
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => onPress(b.id)}
              className={`flex items-center gap-3 rounded-3xl border-2 p-2 pr-3 text-left transition-[background-color,border-color,transform] duration-200 active:scale-[0.99] ${
                done ? "border-jade bg-jade-claro" : "border-linea bg-white hover:border-azul hover:bg-azul-claro"
              }`}
            >
              <Mini kind={BUTTON_MINI[b.id]} className="size-10 shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-bold text-tinta-suave">{b.role}</span>
                <span className="block font-extrabold leading-tight">{b.label}</span>
              </span>
              {done && (
                <span className="flex shrink-0 items-center gap-1 text-sm font-extrabold text-jade-oscuro">
                  <Check width={16} height={16} /> Enviado
                </span>
              )}
            </button>
          );
        })}
      </div>

      {call.state !== "idle" && (
        <div aria-live="polite" className="rounded-3xl bg-naranja-claro px-4 py-3">
          <h3 className="font-extrabold">Aviso urgente a {ADMISSION.contactName}</h3>
          <ol className="mt-2 flex flex-col gap-1.5">
            {STEPS.map((step, i) => {
              const st = stepState(i, call);
              if (st === "skip") return null;
              const Icon = step.icon;
              return (
                <li
                  key={step.key}
                  className={`flex items-center gap-2.5 text-sm ${st === "done" ? "font-bold text-jade-oscuro" : st === "now" ? "font-extrabold text-cafe" : "text-tinta-suave/70"}`}
                >
                  <Icon width={18} height={18} className={st === "now" && i === 2 ? "timbre" : undefined} />
                  <span>
                    {step.label}
                    {i === 3 && st === "done" && <span className="tabular"> en {fmtElapsed(call.startedAt, call.confirmedAt)}</span>}
                    {st === "now" && i < 3 && "…"}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </section>
  );
}
