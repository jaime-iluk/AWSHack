"use client";
// Carril A: web de seguimiento /f/[token]. Letra grande, contraste AA, tono tranquilo.
import { ADMISSION, pendingByCode, REST_PERMISSION, STAGES, statusByCode } from "@/data/demo";
import { canRest, type DemoState } from "@/lib/reducer";
import { fmtTime } from "@/lib/useDemo";

export function FamilyTracker({ state }: { state: DemoState }) {
  const s = statusByCode(state.status);
  return (
    <section className="flex h-full flex-col gap-5 rounded-2xl bg-white p-5 shadow-sm">
      <header>
        <p className="text-xs uppercase tracking-wide text-slate-500">Seguimiento · folio {ADMISSION.folio}</p>
        <h2 className="text-2xl font-semibold text-slate-900">¿Cómo va su paciente?</h2>
      </header>

      <ol className="grid grid-cols-5 gap-1">
        {STAGES.map((st) => {
          const done = st.stage <= state.stage;
          return (
            <li key={st.stage} className="flex flex-col gap-1">
              <span className={`h-2 rounded-full transition-colors duration-500 ${done ? "bg-teal-600" : "bg-slate-200"}`} />
              <span className={`text-[11px] ${st.stage === state.stage ? "font-semibold text-slate-900" : "text-slate-500"}`}>{st.es}</span>
            </li>
          );
        })}
      </ol>

      <div className="text-lg leading-snug text-slate-900">{s.es}</div>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-slate-50 p-3">
          <dt className="text-slate-500">Último cambio</dt>
          <dd className="text-lg font-semibold">{fmtTime(state.lastChangeAt)}</dd>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <dt className="text-slate-500">Próximo informe</dt>
          <dd className="text-lg font-semibold">{state.nextReport ?? "Por confirmar"}</dd>
        </div>
      </dl>

      <div>
        <h3 className="mb-2 font-semibold text-slate-900">Pendientes para usted</h3>
        {state.pendings.length === 0 ? (
          <p className="text-slate-600">No hay nada pendiente.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {state.pendings.map((p) => (
              <li key={p.code} className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-amber-950">{pendingByCode(p.code).es}</li>
            ))}
          </ul>
        )}
      </div>

      {canRest(state) && (
        <p className="rounded-xl bg-teal-50 p-4 text-base text-teal-950">{REST_PERMISSION.replace("{hora}", state.nextReport!)}</p>
      )}

      <nav className="mt-auto grid grid-cols-3 gap-2 text-center text-sm">
        <span className="rounded-xl bg-slate-100 p-3">Trámites</span>
        <span className="rounded-xl bg-slate-100 p-3">Lugares cercanos</span>
        <span className="rounded-xl bg-slate-100 p-3">Hablar con una persona</span>
      </nav>
    </section>
  );
}
