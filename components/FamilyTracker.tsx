"use client";
// Web de seguimiento para la familia (sin descarga). Letra grande, una idea principal, tono tranquilo.
import { ADMISSION, pendingByCode, REST_PERMISSION, STAGES, statusByCode, TRACKER_SHORTCUTS } from "@/data/demo";
import { canRest, type DemoState } from "@/lib/reducer";
import { fmtTime } from "@/lib/useDemo";
import { Cama, Huella, Papel, Persona, Reloj } from "./Icons";

const SHORTCUT_ICON = { tramites: Papel, lugares: Cama, persona: Persona } as const;

function Camino({ stage }: { stage: number }) {
  return (
    <ol className="grid grid-cols-5" aria-label={`Etapa ${stage} de ${STAGES.length}`}>
      {STAGES.map((st, i) => {
        const done = st.stage < stage;
        const now = st.stage === stage;
        return (
          <li key={st.stage} className="relative flex flex-col items-center gap-2 text-center" aria-current={now ? "step" : undefined}>
            {i > 0 && (
              <span
                aria-hidden
                className={`absolute right-1/2 top-[18px] h-0.5 w-full -translate-y-1/2 ${st.stage <= stage ? "bg-jade-600" : "bg-cal-200"}`}
                style={{ maskImage: "repeating-linear-gradient(90deg,#000 0 6px,transparent 6px 11px)" }}
              />
            )}
            <span
              key={now ? `now-${stage}` : st.stage}
              className={`relative z-10 grid size-9 place-items-center rounded-full ${
                now ? "pisada bg-jade-600 text-white" : done ? "bg-jade-100 text-jade-700" : "bg-white text-cal-200 ring-2 ring-cal-200"
              }`}
            >
              <Huella width={20} height={20} filled={done || now} className={i % 2 ? "-scale-x-100" : undefined} />
            </span>
            <span lang="es" className={`hyphens-auto px-0.5 text-[13px] leading-tight ${now ? "font-bold text-anil-950" : done ? "text-jade-700" : "text-tinta-muted"}`}>{st.es}</span>
          </li>
        );
      })}
    </ol>
  );
}

export function FamilyTracker({ state, onAsk }: { state: DemoState; onAsk?: (t: string) => void }) {
  const s = statusByCode(state.status);
  const pendingP03 = state.pendings.find((p) => p.code === "P03");

  return (
    <section aria-labelledby="seg-title" className="flex h-full min-h-0 flex-col overflow-hidden rounded-3xl bg-white shadow-[0_1px_2px_rgba(16,23,58,0.06),0_8px_24px_-12px_rgba(16,23,58,0.18)]">
      <div className="flex items-center gap-2 border-b border-cal-200 bg-cal px-5 py-2.5 text-sm text-tinta-muted">
        <span className="size-2.5 rounded-full bg-cal-200" aria-hidden />
        <span translate="no">painani.mx/f/{ADMISSION.token}</span>
        <span className="ml-auto">Abierto desde el enlace de WhatsApp</span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5">
        <div>
          <h2 id="seg-title" className="text-[28px] font-bold leading-tight text-anil-950 text-balance">¿Cómo va su paciente?</h2>
          <p className="mt-1 text-sm text-tinta-muted">
            Folio <span className="tabular" translate="no">{ADMISSION.folio}</span>, {ADMISSION.contactName}
          </p>
        </div>

        <Camino stage={state.stage} />

        <div aria-live="polite">
          {s.critical && state.call.state !== "coming" && s.code === "E07" && (
            <p className="mb-2 inline-block rounded-full bg-ambar-100 px-3 py-1 text-sm font-bold text-ambar-800">Le necesitamos en informes</p>
          )}
          <p className="text-xl leading-snug text-anil-950 text-pretty">{s.es}</p>
          {state.call.state === "coming" && (
            <p className="mt-2 text-base font-bold text-jade-700">Usted confirmó que va en camino. Le esperan en informes.</p>
          )}
        </div>

        <dl className="grid grid-cols-2 divide-x divide-cal-200 border-y border-cal-200 py-3">
          <div className="pr-4">
            <dt className="text-sm text-tinta-muted">Último aviso</dt>
            <dd className="text-2xl font-bold tabular">{fmtTime(state.lastChangeAt)}</dd>
          </div>
          <div className="pl-5">
            <dt className="text-sm text-tinta-muted">Próximo informe médico</dt>
            <dd className="text-2xl font-bold tabular">{state.nextReport ?? "Por confirmar"}</dd>
          </div>
        </dl>

        {pendingP03 ? (
          <div className="rounded-2xl bg-ambar-100 p-4 text-ambar-800">
            <p className="font-bold">Se necesita algo de usted</p>
            <p className="mt-1 text-lg font-bold text-pretty">{pendingByCode("P03").es}</p>
            {onAsk && (
              <button
                type="button"
                onClick={() => onAsk("¿Qué trámites tengo que hacer?")}
                className="mt-2 rounded-full bg-ambar-800 px-4 py-2 text-sm font-bold text-white transition-colors duration-200 hover:bg-ambar-600"
              >
                Ver qué hacer
              </button>
            )}
          </div>
        ) : canRest(state) ? (
          <div className="flex gap-4 rounded-2xl bg-jade-100 p-5 text-jade-700">
            <Reloj width={28} height={28} className="mt-0.5 shrink-0" />
            <p className="text-xl leading-snug text-pretty">{REST_PERMISSION.replace("{hora}", state.nextReport!)}</p>
          </div>
        ) : (
          <p className="text-lg text-tinta-muted">Por ahora no hay nada pendiente para usted.</p>
        )}

        <nav aria-label="Ayuda" className="mt-auto grid grid-cols-3 gap-2">
          {TRACKER_SHORTCUTS.map((sc) => {
            const Icon = SHORTCUT_ICON[sc.id];
            return (
              <button
                key={sc.id}
                type="button"
                onClick={() => onAsk?.(sc.question)}
                className="flex flex-col items-start gap-1.5 rounded-2xl bg-anil-50 p-3 text-left text-sm font-bold text-anil-900 transition-colors duration-200 hover:bg-anil-100"
              >
                <Icon />
                {sc.label}
              </button>
            );
          })}
        </nav>
      </div>
    </section>
  );
}
