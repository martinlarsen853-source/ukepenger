"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";

function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-7xl px-4 ${className}`}>{children}</div>;
}

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4">
      <path d="M4 10h10m0 0-4-4m4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4">
      <path d="m4 10 4 4 8-8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/85 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="text-base font-semibold text-white" aria-label="Ukepenger hjem">
          Ukepenger
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-slate-300 md:flex">
          <a href="#how" className="transition hover:text-white">
            Slik funker det
          </a>
          <a href="#benefits" className="transition hover:text-white">
            Fordeler
          </a>
          <Link href="/login" className="transition hover:text-white">
            Logg inn
          </Link>
        </nav>

        <button
          type="button"
          aria-label="Aapne meny"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 text-slate-200 md:hidden"
        >
          <span className="text-lg leading-none">{open ? "x" : "="}</span>
        </button>
      </Container>

      {open && (
        <div className="border-t border-white/10 bg-slate-950 md:hidden">
          <Container className="flex flex-col py-3 text-sm text-slate-200">
            <a href="#how" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 hover:bg-white/5">
              Slik funker det
            </a>
            <a href="#benefits" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 hover:bg-white/5">
              Fordeler
            </a>
            <Link href="/login" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 hover:bg-white/5">
              Logg inn
            </Link>
          </Container>
        </div>
      )}
    </header>
  );
}

function PhoneMock({ variant = "tasks" }: { variant?: "tasks" | "approve" | "payout" }) {
  return (
    <div className="relative w-full max-w-[520px]">
      <div className="rounded-[32px] border border-white/15 bg-white/95 p-3 shadow-[0_40px_100px_-40px_rgba(0,0,0,0.55)]">
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

          {variant === "tasks" && (
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                <span>Rydde rom</span>
                <span>5 kr</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                <span>Tomme oppvaskmaskin</span>
                <span>10 kr</span>
              </div>
              <button type="button" className="w-full rounded-xl bg-lime-400 px-4 py-2.5 font-semibold text-slate-900">
                Send krav
              </button>
            </div>
          )}

          {variant === "approve" && (
            <div className="space-y-2 text-sm">
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
                      NO
                    </span>
                    <span className="font-medium">Noah | Rydde rom</span>
                  </div>
                  <span>5 kr</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" className="rounded-xl bg-lime-400 px-3 py-2.5 font-semibold text-slate-900">
                  Godkjenn
                </button>
                <button type="button" className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-semibold text-slate-700">
                  Avvis
                </button>
              </div>
            </div>
          )}

          {variant === "payout" && (
            <div className="space-y-2 text-sm">
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="font-medium text-slate-900">Til gode</p>
                <p className="text-slate-600">25 kr</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3 text-slate-600">Kontanter / Vipps / Bank</div>
              <button type="button" className="w-full rounded-xl bg-lime-400 px-4 py-2.5 font-semibold text-slate-900">
                Utbetal
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DebitCardMock() {
  return (
    <motion.div
      aria-hidden="true"
      className="absolute -right-4 top-8 w-52 rounded-3xl border border-white/20 bg-slate-900/70 p-4 text-white shadow-2xl backdrop-blur md:w-60"
      animate={{ y: [0, -8, 0], rotate: [0, 1.6, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    >
      <p className="text-xs text-slate-300">Ukepenger</p>
      <div className="mt-3 h-8 w-11 rounded-md border border-white/20 bg-gradient-to-br from-slate-400/30 to-slate-200/10" />
      <p className="mt-4 text-sm tracking-[0.16em] text-slate-200">1234 5678 9876</p>
      <div className="mt-4 flex items-center justify-end gap-1">
        <span className="h-5 w-5 rounded-full bg-amber-300/80" />
        <span className="-ml-2 h-5 w-5 rounded-full bg-rose-300/80" />
      </div>
    </motion.div>
  );
}

function StatItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
      <span className="text-lime-300">
        <CheckIcon />
      </span>
      <span>{label}</span>
    </div>
  );
}

function FeatureCard({ title, text }: { title: string; text: string }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-slate-600">{text}</p>
    </article>
  );
}

function StepCard({ n, title }: { n: string; title: string }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-lime-300 font-semibold text-slate-900">{n}</span>
      <h3 className="mt-4 text-xl font-semibold text-slate-900">{title}</h3>
    </article>
  );
}

export default function LandingClient() {
  return (
    <main className="bg-slate-50 text-slate-900">
      <Nav />

      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-950 to-emerald-950 py-20 text-white md:py-28">
        <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />

        <Container className="grid items-center gap-14 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-[520px]"
          >
            <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-[0.14em]">FAMILIEAPP</p>
            <h1 className="mt-6 text-5xl font-semibold tracking-tight md:text-7xl">Full kontroll paa ukepenger.</h1>
            <p className="mt-6 text-lg text-slate-300 md:text-xl">Barn registrerer oppgaver. Du godkjenner og betaler.</p>

            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Link
                href="/login"
                aria-label="Kom i gang"
                className="inline-flex min-h-12 items-center rounded-xl bg-lime-300 px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-lime-900/20 transition hover:bg-lime-400"
              >
                Kom i gang
              </Link>
              <a href="#how" className="inline-flex min-h-12 items-center gap-2 text-sm font-semibold text-slate-200 transition hover:text-white" aria-label="Se hvordan det funker">
                Se hvordan det funker
                <ArrowIcon />
              </a>
            </div>

            <div className="mt-8 grid gap-2 text-sm text-slate-200 sm:grid-cols-3">
              <StatItem label="4.8 stjerner" />
              <StatItem label="Mobilvennlig" />
              <StatItem label="Full historikk" />
            </div>
          </motion.div>

          <div className="relative mx-auto w-full max-w-[560px]">
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}>
              <PhoneMock variant="tasks" />
            </motion.div>
            <DebitCardMock />
          </div>
        </Container>
      </section>

      <section className="bg-white py-16 md:py-24">
        <Container className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">Oppgaver</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Barn registrerer oppgaver</h2>
            <p className="mt-4 text-slate-600">Gi barna en enkel oversikt over oppgaver og belop. De sender krav med ett trykk.</p>
          </div>
          <PhoneMock variant="tasks" />
        </Container>
      </section>

      <section className="bg-slate-50 py-16 md:py-24">
        <Container className="grid items-center gap-10 md:grid-cols-2">
          <div className="md:order-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">Godkjenning</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Du godkjenner</h2>
            <p className="mt-4 text-slate-600">Se innsendte krav i en ryddig innboks og godkjenn eller avvis med tydelig kontroll.</p>
          </div>
          <div className="md:order-1">
            <PhoneMock variant="approve" />
          </div>
        </Container>
      </section>

      <section className="bg-white py-16 md:py-24">
        <Container className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">Utbetaling</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Utbetal naar det passer</h2>
            <p className="mt-4 text-slate-600">Velg metode og utbetal i ditt tempo. Historikken holder styr paa alt.</p>
          </div>
          <PhoneMock variant="payout" />
        </Container>
      </section>

      <section id="benefits" className="bg-slate-50 py-16 md:py-24">
        <Container>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Fordeler</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <FeatureCard title="Kontroll og oversikt" text="Se saldo, krav og utbetaling samlet for hele familien." />
            <FeatureCard title="Mindre mas" text="Barn sender selv, og du svarer raskt uten manuelle lister." />
            <FeatureCard title="Mobil-first" text="Alt er laget for telefon, sa du kan styre i hverdagen." />
          </div>
        </Container>
      </section>

      <section id="how" className="bg-white py-16 md:py-24">
        <Container>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Slik funker det</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <StepCard n="1" title="Velg oppgaver" />
            <StepCard n="2" title="Barn sender krav" />
            <StepCard n="3" title="Du godkjenner og utbetaler" />
          </div>
        </Container>
      </section>

      <section className="bg-slate-50 py-16 md:py-24">
        <Container>
          <div className="rounded-3xl border border-white/10 bg-slate-950 p-8 text-center text-white md:p-12">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Kom i gang paa 2 minutter</h2>
            <p className="mt-3 text-slate-300">Gratis a bruke.</p>
            <Link
              href="/login"
              aria-label="Kom i gang naa"
              className="mt-6 inline-flex min-h-12 items-center rounded-xl bg-lime-300 px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-lime-900/20 transition hover:bg-lime-400"
            >
              Kom i gang
            </Link>
          </div>
        </Container>
      </section>
    </main>
  );
}

