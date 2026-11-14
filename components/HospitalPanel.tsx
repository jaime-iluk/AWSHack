"use client";
// Carril A: rediseñar libremente (skills frontend-design / impeccable). Mantener las props.
import { ADMISSION, DEMO_BUTTONS, HOSPITAL, statusByCode, type DemoButtonId } from "@/data/demo";
import type { DemoState } from "@/lib/reducer";
import { fmtElapsed, fmtTime } from "@/lib/useDemo";

const CALL_LABEL: Record<DemoState["call"]["state"], string> = {
  idle: "",
  waiting: "Aviso enviado por WhatsApp · esperando confirmación…",
  sms_sent: "Sin lectura · SMS enviado",
  calling: "Llamando al familiar…",
  coming: "Familiar en camino",
};

export function HospitalPanel({ state, onPress, onReset }: { state: DemoState; onPress: (id: DemoButtonId) => void; onReset: () => void }) {
  const s = statusByCode(state.status);
  return (
    <section className="flex h-full flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm">
      <header>
        <p className="text-xs uppercase tracking-wide text-slate-500">Panel del hospital · {HOSPITAL.area}</p>
        <h2 className="text-xl font-semibold text-slate-900">Folio {ADMISSION.folio}</h2>
        <p className="text-sm text-slate-600">Contacto vinculado: {ADMISSION.contactName} · idioma náhuatl</p>
      </header>

      <div className="rounded-xl bg-slate-50 p-3 text-sm">
        <p className="text-slate-500">Estado publicado ({fmtTime(state.lastChangeAt)})</p>
        <p className="font-medium text-slate-900">{s.code} · {s.es}</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {DEMO_BUTTONS.map((b) => (
          <button
            key={b.id}
            onClick={() => onPress(b.id)}
            className="rounded-xl border border-slate-200 px-4 py-4 text-left transition hover:border-teal-500 hover:bg-teal-50 active:scale-[0.99]"
          >
            <span className="block text-xs text-slate-500">{b.role} · {b.id}</span>
            <span className="text-base font-medium text-slate-900">{b.label}</span>
          </button>
        ))}
      </div>

      {state.call.state !== "idle" && (
        <div className={`rounded-xl p-3 text-sm ${state.call.state === "coming" ? "bg-teal-50 text-teal-900" : "bg-amber-50 text-amber-900"}`}>
          {CALL_LABEL[state.call.state]}
          {state.call.state === "coming" && ` · ${fmtElapsed(state.call.startedAt, state.call.confirmedAt)}`}
        </div>
      )}

      <button onClick={onReset} className="mt-auto text-xs text-slate-400 underline">Reiniciar demo</button>
    </section>
  );
}
