"use client";
// Versión para hacer la demo en un celular real: la app a pantalla completa
// y el panel del hospital en una hoja inferior (botón "Hospital").
import { useState } from "react";
import { PainaniApp } from "@/components/app/PainaniApp";
import { HospitalPanel } from "@/components/HospitalPanel";
import type { DemoButtonId } from "@/data/demo";
import { useDemo } from "@/lib/useDemo";

export default function CelularPage() {
  const { state, press, confirmComing, reset, ask } = useDemo();
  const [linked, setLinked] = useState(false);
  const [panel, setPanel] = useState(false);

  const publish = (id: DemoButtonId) => {
    press(id);
    setPanel(false); // se cierra para ver llegar el aviso
  };

  const restart = () => {
    setLinked(false);
    setPanel(false);
    reset();
  };

  if (!state.ready) return <p className="p-6 text-tinta-suave">Cargando…</p>;

  return (
    <main className="relative h-dvh overflow-hidden bg-white">
      <h1 className="sr-only">Painani</h1>
      <PainaniApp state={state} linked={linked} onLinked={() => setLinked(true)} onAsk={ask} onConfirm={confirmComing} fullscreen />

      {!panel && (
        <button
          type="button"
          onClick={() => setPanel(true)}
          aria-label="Abrir panel del hospital"
          className="fixed right-3 top-[calc(env(safe-area-inset-top)+0.5rem)] z-[60] rounded-full bg-tinta/85 px-3 py-1.5 text-xs font-extrabold text-white shadow-lg backdrop-blur"
        >
          Hospital
        </button>
      )}

      {panel && (
        <div className="fixed inset-0 z-[70] flex flex-col justify-end bg-tinta/40" onClick={() => setPanel(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Panel del hospital"
            onClick={(e) => e.stopPropagation()}
            className="sube relative max-h-[88dvh] overflow-y-auto rounded-t-[32px] bg-fondo p-3 pb-[max(1rem,env(safe-area-inset-bottom))]"
          >
            <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-linea" aria-hidden />
            <HospitalPanel state={state} onPress={publish} onReset={restart} linked={linked} />
            <button type="button" onClick={() => setPanel(false)} className="mt-3 w-full rounded-full bg-white py-3 font-extrabold text-tinta">
              Volver al teléfono de Rosa
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
