"use client";
import { useState } from "react";
import { PainaniApp } from "@/components/app/PainaniApp";
import { HospitalPanel } from "@/components/HospitalPanel";
import { useDemo } from "@/lib/useDemo";

export default function DemoPage() {
  const { state, press, confirmComing, reset, ask } = useDemo();
  const [linked, setLinked] = useState(false);

  const restart = () => {
    setLinked(false);
    reset();
  };

  return (
    <main className="flex h-dvh min-h-[760px] items-stretch justify-center px-8 py-6">
      <h1 className="sr-only">Painani: demostración</h1>
      {state.ready ? (
        <div className="grid min-h-0 w-full max-w-[860px] flex-1 grid-cols-1 gap-10 lg:grid-cols-[380px_400px] lg:justify-center">
          <HospitalPanel state={state} onPress={press} onReset={restart} linked={linked} />
          <PainaniApp state={state} linked={linked} onLinked={() => setLinked(true)} onAsk={ask} onConfirm={confirmComing} />
        </div>
      ) : (
        <p className="self-center text-tinta-suave">Cargando la demostración…</p>
      )}
    </main>
  );
}
