"use client";
import { FamilyTracker } from "@/components/FamilyTracker";
import { HospitalPanel } from "@/components/HospitalPanel";
import { Marca } from "@/components/Icons";
import { PhoneSimulator } from "@/components/PhoneSimulator";
import { HOSPITAL, SERVICE_NAME } from "@/data/demo";
import { useDemo } from "@/lib/useDemo";

export default function DemoPage() {
  const { state, press, confirmComing, reset, ask } = useDemo();

  return (
    <main className="flex h-dvh min-h-[720px] flex-col gap-5 px-6 pb-6 pt-5">
      <header className="flex items-end justify-between gap-6">
        <div className="flex items-center gap-3 text-anil-700">
          <Marca width={40} height={40} />
          <div>
            <h1 translate="no" className="text-3xl font-bold leading-none tracking-[-0.02em] text-anil-950">{SERVICE_NAME}</h1>
            <p className="mt-1 text-sm text-tinta-muted">El hospital le avisa. Usted no tiene que esperar en la sala.</p>
          </div>
        </div>
        <p className="text-right text-sm text-tinta-muted">
          Demostración con datos de ejemplo
          <br />
          {HOSPITAL.name}
        </p>
      </header>

      {state.ready ? (
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_400px_minmax(0,1fr)]">
          <HospitalPanel state={state} onPress={press} onReset={reset} />
          <PhoneSimulator state={state} onAsk={ask} onConfirm={confirmComing} />
          <FamilyTracker state={state} onAsk={ask} />
        </div>
      ) : (
        <p className="text-tinta-muted">Cargando la demostración…</p>
      )}
    </main>
  );
}
