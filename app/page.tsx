"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function HomePage() {
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setHasSession(Boolean(data.session));
    };

    void run();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <header className="sticky top-0 z-20 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="text-xl font-semibold tracking-tight">Ukepenger</div>
          <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
            <a href="#hvordan" className="transition hover:text-white">Hvordan det funker</a>
            <a href="#foreldre" className="transition hover:text-white">For foreldre</a>
            <a href="#barn" className="transition hover:text-white">For barn</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold hover:border-slate-500">
              Logg inn
            </Link>
            {hasSession && (
              <Link href="/admin/inbox" className="rounded-lg bg-emerald-400 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-300">
                Gaa til admin
              </Link>
            )}
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-20 pt-16 md:grid-cols-2 md:pt-24">
        <div>
          <p className="mb-4 inline-flex rounded-full border border-emerald-700/60 bg-emerald-900/30 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-200">
            Ukepenger.no
          </p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-6xl">Ukepenger uten mas</h1>
          <p className="mt-5 max-w-xl text-lg text-slate-300">
            Barn sender inn oppgaver, foreldre godkjenner, og dere far tydelig oversikt over hva som er tjent og utbetalt.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/login" className="rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300">
              Kom i gang
            </Link>
            <Link href="/kids" className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-900">
              Barn
            </Link>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/30">
          <h2 className="text-xl font-semibold">Tre steg til full kontroll</h2>
          <div className="mt-5 space-y-3 text-sm text-slate-300">
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">1. Barn gjor oppgave og sender krav</div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">2. Forelder godkjenner i admin</div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">3. Utbetaling og historikk holdes oppdatert</div>
          </div>
        </div>
      </section>

      <section id="hvordan" className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-semibold tracking-tight">Hvordan det funker</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h3 className="text-lg font-semibold">Barn gjor oppgave</h3>
            <p className="mt-2 text-sm text-slate-300">Barn velger oppgave og sender inn med ett trykk.</p>
          </article>
          <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h3 className="text-lg font-semibold">Forelder godkjenner</h3>
            <p className="mt-2 text-sm text-slate-300">Innboksen viser ventende krav og belop.</p>
          </article>
          <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h3 className="text-lg font-semibold">Utbetaling og oversikt</h3>
            <p className="mt-2 text-sm text-slate-300">Marker utbetalt og behold kvitteringer samlet.</p>
          </article>
        </div>
      </section>

      <section id="foreldre" className="mx-auto max-w-6xl px-4 py-12">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-2xl font-semibold tracking-tight">For foreldre</h2>
          <p className="mt-3 text-slate-300">Mindre mas hjemme. Du ser hva som er sendt inn, godkjenner med kontroll og registrerer utbetaling enkelt.</p>
        </div>
      </section>

      <section id="barn" className="mx-auto max-w-6xl px-4 py-12">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-2xl font-semibold tracking-tight">For barn</h2>
          <p className="mt-3 text-slate-300">Fargerik og enkel opplevelse med klare oppgaver, rask feedback og tydelig progresjon.</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 pt-10">
        <div className="rounded-2xl border border-emerald-800/70 bg-emerald-950/30 p-8 text-center">
          <h2 className="text-3xl font-semibold tracking-tight">Klar for a teste med familien?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-200">Sett opp pa noen minutter og start med deres forste oppgaver i dag.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/login" className="rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-300">Kom i gang</Link>
            <Link href="/kids" className="rounded-xl border border-slate-600 px-5 py-3 text-sm font-semibold text-slate-100 hover:border-slate-400">Barn</Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-800 px-4 py-8 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} Ukepenger.no
      </footer>
    </main>
  );
}
