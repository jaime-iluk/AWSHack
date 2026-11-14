"use client";
import { useState } from "react";
import { PainaniApp } from "@/components/app/PainaniApp";
import { HospitalPanel } from "@/components/HospitalPanel";
import { Marca } from "@/components/Icons";
import { StoryCaption } from "@/components/StoryCaption";
import { HOSPITAL, SERVICE_NAME } from "@/data/demo";
import { useDemo } from "@/lib/useDemo";

export default function DemoPage() {
  const { state, press, confirmComing, reset, ask } = useDemo();
  const [linked, setLinked] = useState(false);

  const restart = () => {
    setLinked(false);
    reset();
  };

  return (
    <main className="flex h-dvh min-h-[760px] flex-col gap-5 px-8 pb-6 pt-5">
      <header className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-cielo text-white">
            <Marca width={30} height={30} />
          </span>
          <div>
            <h1 translate="no" className="text-2xl font-extrabold leading-none">
              {SERVICE_NAME}
            </h1>
            <p className="mt-1 text-sm text-tinta-suave">El hospital le avisa. Usted no tiene que esperar en la sala.</p>
          </div>
        </div>
        <p className="text-right text-sm text-tinta-suave">
          Demostración con datos de ejemplo
          <br />
          {HOSPITAL.name}
        </p>
      </header>

      {state.ready ? (
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-8 lg:grid-cols-[340px_390px_minmax(0,1fr)]">
          <HospitalPanel state={state} onPress={press} onReset={restart} linked={linked} />
          <PainaniApp state={state} linked={linked} onLinked={() => setLinked(true)} onAsk={ask} onConfirm={confirmComing} />
          <StoryCaption state={state} linked={linked} />
        </div>
      ) : (
        <p className="text-tinta-suave">Cargando la demostración…</p>
      )}
    </main>
  );
}
