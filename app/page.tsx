import Link from "next/link";
import type { Metadata } from "next";
import HeroDeviceDemo from "@/app/components/HeroDeviceDemo";

export const metadata: Metadata = {
  title: "Ukepenger - full kontroll pa ukepenger",
  description: "Barn registrerer oppgaver. Du godkjenner og betaler.",
};

type StaticDemoMode = "tasks" | "inbox" | "payout";

function StaticDeviceDemo({ mode }: { mode: StaticDemoMode }) {
  return (
    <div className="mx-auto w-full max-w-md rounded-[32px] border border-slate-200 bg-white p-3 shadow-xl shadow-slate-200/70">
      <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-4">
        <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-300" />
            <span className="h-2 w-2 rounded-full bg-amber-300" />
            <span className="h-2 w-2 rounded-full bg-emerald-300" />
          </div>
          <span className="font-medium text-slate-700">App preview</span>
          <span className="w-8" />
        </div>

        {mode === "tasks" && (
          <div className="space-y-2 text-sm">
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="font-medium text-slate-900">Rydde rom</p>
              <p className="text-slate-600">5 kr</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="font-medium text-slate-900">Tomme oppvaskmaskin</p>
              <p className="text-slate-600">10 kr</p>
            </div>
            <button className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">Send krav</button>
          </div>
        )}

        {mode === "inbox" && (
          <div className="space-y-2 text-sm">
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="font-medium text-slate-900">Noah | Rydde rom</p>
              <p className="text-slate-600">5 kr</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="font-medium text-slate-900">Maja | Tomme oppvaskmaskin</p>
              <p className="text-slate-600">10 kr</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button className="rounded-xl bg-emerald-500 px-3 py-2.5 text-sm font-semibold text-white">Godkjenn</button>
              <button className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700">Avvis</button>
            </div>
          </div>
        )}

        {mode === "payout" && (
          <div className="space-y-2 text-sm">
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="font-medium text-slate-900">Til gode</p>
              <p className="text-slate-600">25 kr</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="font-medium text-slate-900">Metode</p>
              <p className="text-slate-600">Kontanter</p>
            </div>
            <button className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">Utbetal nar det passer</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="bg-slate-50 text-slate-900">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 top-24 h-[24rem] w-[24rem] rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-24 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-[0.14em] text-slate-200">
              FAMILIEAPP
            </p>
            <h1 className="mt-6 text-5xl font-bold leading-[1.02] tracking-tight md:text-6xl">Full kontroll pa ukepenger.</h1>
            <p className="mt-6 max-w-xl text-lg text-slate-300 md:text-xl">Barn registrerer oppgaver. Du godkjenner og betaler.</p>
            <div className="mt-10 flex flex-wrap items-center gap-5">
              <Link
                href="/login"
                className="rounded-xl bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/30 transition hover:brightness-110"
              >
                Kom i gang
              </Link>
              <Link href="#how" className="text-sm font-semibold text-slate-300 transition hover:text-white hover:underline underline-offset-4">
                Se hvordan det funker
              </Link>
            </div>
          </div>
          <HeroDeviceDemo />
        </div>
      </section>

      <section className="border-b border-slate-800 bg-slate-900 py-6 text-slate-300">
        <div className="mx-auto grid max-w-6xl gap-3 px-4 text-sm md:grid-cols-3">
          <p>Enkelt oppsett</p>
          <p>Mobilvennlig</p>
          <p>Oversiktlig historikk</p>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Barn registrerer oppgaver</h2>
            <p className="mt-4 text-slate-600">Barn velger oppgaver og sender krav pa sekunder fra mobilen.</p>
          </div>
          <StaticDeviceDemo mode="tasks" />
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-2 md:items-center">
          <div className="md:order-2">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Du godkjenner</h2>
            <p className="mt-4 text-slate-600">Innboksen gir deg kontroll pa hva som er sendt inn, barn for barn.</p>
          </div>
          <div className="md:order-1">
            <StaticDeviceDemo mode="inbox" />
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Utbetal nar det passer</h2>
            <p className="mt-4 text-slate-600">Du velger metode og markerer utbetaling nar det passer familien.</p>
          </div>
          <StaticDeviceDemo mode="payout" />
        </div>
      </section>

      <section id="how" className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Slik funker det</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-slate-200 bg-white p-6">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">1</span>
              <h3 className="mt-4 text-lg font-semibold">Velg oppgaver</h3>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-6">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">2</span>
              <h3 className="mt-4 text-lg font-semibold">Barn sender krav</h3>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-6">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">3</span>
              <h3 className="mt-4 text-lg font-semibold">Du godkjenner og utbetaler</h3>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center md:p-12">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Kom i gang pa 2 minutter</h2>
            <p className="mt-3 text-slate-600">Gratis a bruke.</p>
            <Link href="/login" className="mt-6 inline-flex rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg">
              Kom i gang
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}