"use client";

import { useEffect, useState } from "react";
import DeviceFrame from "@/app/components/DeviceFrame";

type DemoState = 0 | 1 | 2 | 3;
const durations = [2200, 1200, 1800, 1800];

export default function HeroDeviceDemo() {
  const [step, setStep] = useState<DemoState>(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setStep((prev) => ((prev + 1) % 4) as DemoState);
    }, durations[step]);
    return () => clearTimeout(timeout);
  }, [step]);

  return (
    <DeviceFrame floating>
      <div className="relative h-[360px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-4">
        <section
          className={`absolute inset-0 p-4 transition-all duration-500 ${
            step === 0 ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
        >
          <p className="text-xs uppercase tracking-wide text-slate-500">Oppgaver</p>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
              <span>Rydde rom</span>
              <span>5 kr</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
              <span>Tomme oppvaskmaskin</span>
              <span>10 kr</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
              <span>Ta ut soppel</span>
              <span>5 kr</span>
            </div>
          </div>
          <button className="mt-4 w-full rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-300/60">
            Send krav
          </button>
        </section>

        <section
          className={`absolute inset-0 p-4 transition-all duration-500 ${
            step === 1 ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
        >
          <p className="text-xs uppercase tracking-wide text-slate-500">Sender</p>
          <div className="mt-6 flex h-[240px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 [animation:blink_0.8s_infinite]" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 [animation:blink_0.8s_0.15s_infinite]" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 [animation:blink_0.8s_0.3s_infinite]" />
            </div>
            <p className="mt-3 text-sm font-medium text-slate-700">Sender...</p>
          </div>
        </section>

        <section
          className={`absolute inset-0 p-4 transition-all duration-500 ${
            step === 2 ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
        >
          <p className="text-xs uppercase tracking-wide text-slate-500">Status</p>
          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-semibold text-emerald-800">Krav sendt</p>
            <p className="mt-1 text-sm text-emerald-700">Venter paa godkjenning</p>
          </div>
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            <p>Status: Sendt</p>
            <p className="text-slate-500">Vi sier fra naar forelder har sett det.</p>
          </div>
        </section>

        <section
          className={`absolute inset-0 p-4 transition-all duration-500 ${
            step === 3 ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
        >
          <p className="text-xs uppercase tracking-wide text-slate-500">Innboks</p>
          <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 text-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
                  NO
                </span>
                <span className="font-medium text-slate-800">Noah | Rydde rom</span>
              </div>
              <span className="text-slate-600">5 kr</span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                Venter
              </span>
              <button className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white">Godkjenn</button>
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        @keyframes blink {
          0%,
          80%,
          100% {
            opacity: 0.25;
            transform: translateY(0px);
          }
          40% {
            opacity: 1;
            transform: translateY(-2px);
          }
        }
      `}</style>
    </DeviceFrame>
  );
}