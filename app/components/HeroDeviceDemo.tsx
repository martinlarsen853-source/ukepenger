"use client";

import { useEffect, useState } from "react";

type DemoState = 0 | 1 | 2;

export default function HeroDeviceDemo() {
  const [step, setStep] = useState<DemoState>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => ((prev + 1) % 3) as DemoState);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hero-float mx-auto w-full max-w-md">
      <div className="rounded-[32px] border border-white/15 bg-white/[0.06] p-3 shadow-2xl shadow-black/40">
        <div className="rounded-[26px] border border-slate-200/70 bg-slate-50 p-4">
          <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-300" />
              <span className="h-2 w-2 rounded-full bg-amber-300" />
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
            </div>
            <span className="font-medium text-slate-700">Kids view</span>
            <span className="w-8" />
          </div>

          <div className="relative h-[330px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-4">
            <section
              className={`absolute inset-0 p-4 transition-all duration-500 ${
                step === 0 ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
              }`}
            >
              <p className="text-xs uppercase tracking-wide text-slate-500">Velg oppgave</p>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <span>Rydde rom</span>
                  <span>5 kr</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <span>Tomme oppvaskmaskin</span>
                  <span>10 kr</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <span>Ta ut soppel</span>
                  <span>5 kr</span>
                </div>
              </div>
              <button className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">Send krav</button>
            </section>

            <section
              className={`absolute inset-0 p-4 transition-all duration-500 ${
                step === 1 ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
              }`}
            >
              <p className="text-xs uppercase tracking-wide text-slate-500">Sender</p>
              <div className="mt-5 flex h-[240px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-800" />
                <p className="mt-3 text-sm font-medium text-slate-700">Sender krav...</p>
              </div>
            </section>

            <section
              className={`absolute inset-0 p-4 transition-all duration-500 ${
                step === 2 ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
              }`}
            >
              <p className="text-xs uppercase tracking-wide text-slate-500">Status</p>
              <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm font-semibold text-emerald-800">Krav sendt</p>
                <p className="mt-1 text-sm text-emerald-700">Venter pa godkjenning</p>
              </div>
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                Saldo oppdateres nar forelder godkjenner.
              </div>
            </section>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hero-float {
          animation: float-device 6s ease-in-out infinite;
        }

        @keyframes float-device {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }
      `}</style>
    </div>
  );
}