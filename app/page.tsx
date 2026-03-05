import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ukepenger - full kontroll pa ukepengene",
  description:
    "Barna registrerer oppgaver. Du godkjenner pa mobilen og utbetaler nar det passer.",
};

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute left-1/2 top-24 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-[42rem] h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-indigo-500/15 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-950 to-black" />

      <section className="relative py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="max-w-2xl">
            <p className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-200">
              Foreldre-kontroll
            </p>
            <h1 className="mt-6 max-w-2xl text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl">
              Full kontroll pa ukepengene.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70 md:text-xl">
              Barna registrerer oppgaver. Du godkjenner pa mobilen og utbetaler nar det passer.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-5">
              <Link
                href="/login"
                className="rounded-xl bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/25 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                Kom i gang
              </Link>
              <Link
                href="#how"
                className="text-sm font-semibold text-white/70 transition hover:text-white hover:underline underline-offset-4"
              >
                Se hvordan det funker
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mt-16 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-10">
          <div className="grid gap-6 lg:grid-cols-2">
            <article className="overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.03] p-5 shadow-2xl shadow-black/40 md:p-6">
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-xs text-white/70">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-red-300/80" />
                  <span className="h-2 w-2 rounded-full bg-amber-300/80" />
                  <span className="h-2 w-2 rounded-full bg-emerald-300/80" />
                </div>
                <p className="font-medium tracking-wide">Barn</p>
                <span className="w-8" />
              </div>
              <div className="mt-4 rounded-2xl border border-white/10 bg-slate-900/75 p-4 md:p-5">
                <p className="text-sm text-white/60">Saldo i dag</p>
                <ul className="mt-3 space-y-2 text-sm text-white/85">
                  <li className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
                    <span>Venter</span>
                    <span>10 kr</span>
                  </li>
                  <li className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
                    <span>Til gode</span>
                    <span>25 kr</span>
                  </li>
                  <li className="flex items-center justify-between rounded-xl border border-cyan-300/20 bg-cyan-400/10 px-3 py-2.5 font-semibold text-cyan-100">
                    <span>Totalt</span>
                    <span>35 kr</span>
                  </li>
                </ul>
              </div>
              <div className="mt-4 space-y-2.5 text-sm">
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/75 px-3 py-2.5">
                  <span>Rydde rom</span>
                  <span className="text-white/70">5 kr</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/75 px-3 py-2.5">
                  <span>Ta ut soppel</span>
                  <span className="text-white/70">5 kr</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/75 px-3 py-2.5">
                  <span>Tomme oppvaskmaskin</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white/70">10 kr</span>
                    <span className="rounded-full border border-emerald-300/30 bg-emerald-400/20 px-2 py-0.5 text-xs font-semibold text-emerald-100">
                      Sendt
                    </span>
                  </div>
                </div>
              </div>
            </article>

            <article className="overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.03] p-5 shadow-2xl shadow-black/40 md:p-6">
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-xs text-white/70">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-red-300/80" />
                  <span className="h-2 w-2 rounded-full bg-amber-300/80" />
                  <span className="h-2 w-2 rounded-full bg-emerald-300/80" />
                </div>
                <p className="font-medium tracking-wide">Forelder</p>
                <span className="w-8" />
              </div>
              <div className="mt-4 rounded-2xl border border-white/10 bg-slate-900/75 p-4 md:p-5">
                <h3 className="text-sm font-semibold text-white/90">Ventende krav</h3>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
                    <p className="font-medium">Noah | Rydde rom | 5 kr</p>
                    <span className="mt-1 inline-flex rounded-full border border-amber-300/30 bg-amber-400/20 px-2 py-0.5 text-xs font-semibold text-amber-100">
                      Venter
                    </span>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
                    <p className="font-medium">Maja | Tomme oppvaskmaskin | 10 kr</p>
                    <span className="mt-1 inline-flex rounded-full border border-amber-300/30 bg-amber-400/20 px-2 py-0.5 text-xs font-semibold text-amber-100">
                      Venter
                    </span>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    className="rounded-xl bg-emerald-400 px-3 py-2.5 text-sm font-semibold text-slate-950"
                  >
                    Godkjenn
                  </button>
                  <button
                    type="button"
                    className="rounded-xl border border-white/20 bg-white/5 px-3 py-2.5 text-sm font-semibold text-slate-100"
                  >
                    Avvis
                  </button>
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-white/10 bg-slate-900/75 p-4 md:p-5">
                <h3 className="text-sm font-semibold text-white/90">Utbetalinger</h3>
                <button
                  type="button"
                  className="mt-3 w-full rounded-xl bg-cyan-400 px-3 py-2.5 text-sm font-semibold text-slate-950"
                >
                  Utbetal alt (25 kr)
                </button>
                <p className="mt-3 text-sm text-white/70">Metode: Kontanter</p>
              </div>
            </article>
          </div>
          </div>
        </div>
      </section>

      <section className="relative mt-16 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30">
              <p className="text-xl">📊</p>
              <h2 className="text-xl font-semibold">Kontroll og oversikt</h2>
              <p className="mt-2 text-sm text-white/70">Se saldo og historikk samlet for hele familien.</p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30">
              <p className="text-xl">🧹</p>
              <h2 className="text-xl font-semibold">Mindre mas</h2>
              <p className="mt-2 text-sm text-white/70">Barna registrerer selv, sa du slipper a holde styr manuelt.</p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30">
              <p className="text-xl">📱</p>
              <h2 className="text-xl font-semibold">Mobil-first</h2>
              <p className="mt-2 text-sm text-white/70">Godkjenn og utbetal pa telefon, uansett hvor du er.</p>
            </article>
          </div>
        </div>
      </section>

      <section id="how" className="relative mt-16 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">Slik funker det</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30">
              <p className="text-xl">1️⃣</p>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">Steg 1</p>
              <h3 className="mt-2 text-lg font-semibold">Velg oppgaver</h3>
              <p className="mt-2 text-sm text-white/70">Start med forslag - eller lag egne.</p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30">
              <p className="text-xl">2️⃣</p>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">Steg 2</p>
              <h3 className="mt-2 text-lg font-semibold">Barn sender krav</h3>
              <p className="mt-2 text-sm text-white/70">Oppgaver registreres fortlopende av barna.</p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30">
              <p className="text-xl">3️⃣</p>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">Steg 3</p>
              <h3 className="mt-2 text-lg font-semibold">Du godkjenner og utbetaler</h3>
              <p className="mt-2 text-sm text-white/70">Alt holdes oppdatert med fa trykk.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="relative mt-20 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="rounded-2xl border border-white/20 bg-white/10 p-8 text-center backdrop-blur shadow-2xl shadow-black/40">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Kom i gang pa 2 minutter</h2>
            <p className="mt-3 text-white/70">Gratis a bruke.</p>
            <Link
              href="/login"
              className="mt-6 inline-flex rounded-xl bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/30 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Kom i gang
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
