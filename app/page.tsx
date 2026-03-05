import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ukepenger – full kontroll pa ukepengene",
  description:
    "Barna registrerer oppgaver. Du godkjenner pa mobilen og utbetaler nar det passer.",
};

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-1/3 h-72 w-72 rounded-full bg-indigo-500/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-950 to-black" />

      <section className="relative py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="max-w-3xl">
            <p className="inline-flex rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">
              Foreldre-kontroll
            </p>
            <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
              Full kontroll pa ukepengene.
            </h1>
            <p className="mt-5 text-lg text-slate-300">
              Barna registrerer oppgaver. Du godkjenner pa mobilen og utbetaler nar det passer.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="rounded-xl bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/25 transition hover:bg-cyan-300"
              >
                Kom i gang
              </Link>
              <Link
                href="#how"
                className="rounded-xl border border-white/25 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-100 backdrop-blur transition hover:border-white/40"
              >
                Se hvordan det funker
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <article className="rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur shadow-2xl shadow-black/40">
              <p className="text-sm font-semibold text-cyan-200">Barn</p>
              <div className="mt-4 rounded-2xl border border-white/15 bg-slate-900/80 p-4">
                <p className="text-sm text-slate-400">Saldo i dag</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-200">
                  <li className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <span>Venter</span>
                    <span>10 kr</span>
                  </li>
                  <li className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <span>Til gode</span>
                    <span>25 kr</span>
                  </li>
                  <li className="flex items-center justify-between rounded-xl border border-white/10 bg-cyan-400/10 px-3 py-2 font-semibold text-cyan-100">
                    <span>Totalt</span>
                    <span>35 kr</span>
                  </li>
                </ul>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between rounded-xl border border-white/15 bg-white/5 px-3 py-2">
                  <span>Rydde rom</span>
                  <span className="text-slate-300">5 kr</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-white/15 bg-white/5 px-3 py-2">
                  <span>Ta ut soppel</span>
                  <span className="text-slate-300">5 kr</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-white/15 bg-white/5 px-3 py-2">
                  <span>Tomme oppvaskmaskin</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-300">10 kr</span>
                    <span className="rounded-full border border-emerald-300/30 bg-emerald-400/20 px-2 py-0.5 text-xs font-semibold text-emerald-100">
                      Sendt
                    </span>
                  </div>
                </div>
              </div>
            </article>

            <article className="rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur shadow-2xl shadow-black/40">
              <p className="text-sm font-semibold text-indigo-200">Forelder</p>
              <div className="mt-4 rounded-2xl border border-white/15 bg-slate-900/80 p-4">
                <h3 className="text-sm font-semibold text-slate-200">Ventende krav</h3>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <p className="font-medium">Noah • Rydde rom • 5 kr</p>
                    <span className="mt-1 inline-flex rounded-full border border-amber-300/30 bg-amber-400/20 px-2 py-0.5 text-xs font-semibold text-amber-100">
                      Venter
                    </span>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <p className="font-medium">Maja • Tomme oppvaskmaskin • 10 kr</p>
                    <span className="mt-1 inline-flex rounded-full border border-amber-300/30 bg-amber-400/20 px-2 py-0.5 text-xs font-semibold text-amber-100">
                      Venter
                    </span>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    className="rounded-xl bg-emerald-400 px-3 py-2 text-sm font-semibold text-slate-950"
                  >
                    Godkjenn
                  </button>
                  <button
                    type="button"
                    className="rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-100"
                  >
                    Avvis
                  </button>
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-white/15 bg-slate-900/80 p-4">
                <h3 className="text-sm font-semibold text-slate-200">Utbetalinger</h3>
                <button
                  type="button"
                  className="mt-3 w-full rounded-xl bg-cyan-400 px-3 py-2 text-sm font-semibold text-slate-950"
                >
                  Utbetal alt (25 kr)
                </button>
                <p className="mt-3 text-sm text-slate-300">Metode: Kontanter</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="relative py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur shadow-xl shadow-black/30">
              <h2 className="text-xl font-semibold">Kontroll og oversikt</h2>
              <p className="mt-2 text-sm text-slate-300">Se saldo og historikk samlet for hele familien.</p>
            </article>
            <article className="rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur shadow-xl shadow-black/30">
              <h2 className="text-xl font-semibold">Mindre mas</h2>
              <p className="mt-2 text-sm text-slate-300">Barna registrerer selv, sa du slipper a holde styr manuelt.</p>
            </article>
            <article className="rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur shadow-xl shadow-black/30">
              <h2 className="text-xl font-semibold">Mobil-first</h2>
              <p className="mt-2 text-sm text-slate-300">Godkjenn og utbetal pa telefon, uansett hvor du er.</p>
            </article>
          </div>
        </div>
      </section>

      <section id="how" className="relative py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Slik funker det</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur shadow-xl shadow-black/30">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">Steg 1</p>
              <h3 className="mt-2 text-lg font-semibold">Velg oppgaver</h3>
              <p className="mt-2 text-sm text-slate-300">Start med forslag - eller lag egne.</p>
            </article>
            <article className="rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur shadow-xl shadow-black/30">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">Steg 2</p>
              <h3 className="mt-2 text-lg font-semibold">Barn sender krav</h3>
              <p className="mt-2 text-sm text-slate-300">Oppgaver registreres fortlopende av barna.</p>
            </article>
            <article className="rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur shadow-xl shadow-black/30">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">Steg 3</p>
              <h3 className="mt-2 text-lg font-semibold">Du godkjenner og utbetaler</h3>
              <p className="mt-2 text-sm text-slate-300">Alt holdes oppdatert med fa trykk.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="relative py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="rounded-2xl border border-white/20 bg-white/10 p-8 text-center backdrop-blur shadow-2xl shadow-black/40">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Kom i gang pa 2 minutter</h2>
            <p className="mt-3 text-slate-300">Gratis a bruke.</p>
            <Link
              href="/login"
              className="mt-6 inline-flex rounded-xl bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/30 transition hover:bg-cyan-300"
            >
              Kom i gang
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
