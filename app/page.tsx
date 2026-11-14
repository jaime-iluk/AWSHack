"use client";
import { FamilyTracker } from "@/components/FamilyTracker";
import { HospitalPanel } from "@/components/HospitalPanel";
import { PhoneSimulator } from "@/components/PhoneSimulator";
import { useDemo } from "@/lib/useDemo";

export default function DemoPage() {
  const { state, press, confirmComing, reset, ask } = useDemo();

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <h1 className="mb-4 text-lg font-semibold text-slate-800">
        Sala Tranquila <span className="font-normal text-slate-500">· demo</span>
      </h1>
      {state.ready && (
        <div className="grid h-[calc(100vh-6rem)] grid-cols-1 gap-6 lg:grid-cols-[1fr_380px_1fr]">
          <HospitalPanel state={state} onPress={press} onReset={reset} />
          <PhoneSimulator state={state} onAsk={ask} onConfirm={confirmComing} />
          <FamilyTracker state={state} />
        </div>
      )}
    </main>
  );
}
