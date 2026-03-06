
"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

function cn(...parts: Array<string | undefined | null | false>) {
  return parts.filter(Boolean).join(" ");
}

function Container(props: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", props.className)}>
      {props.children}
    </div>
  );
}

function IconCheck(props: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={props.className}>
      <path
        d="M16.25 5.75l-7.5 8.5-3.5-3.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconArrowRight(props: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={props.className}>
      <path
        d="M7.5 5l5 5-5 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconMenu(props: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={props.className}>
      <path
        d="M3 6h14M3 10h14M3 14h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PrimaryButtonLink(props: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={props.href}
      className={cn(
        "inline-flex items-center justify-center rounded-2xl bg-lime-400 px-6 py-3 text-sm font-semibold text-black shadow-[0_16px_40px_rgba(163,230,53,0.28)] ring-1 ring-lime-300/40 transition hover:bg-lime-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-200",
        props.className
      )}
    >
      {props.children}
    </Link>
  );
}

function SecondaryLink(props: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={props.href}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-xl px-2 py-2 text-sm font-medium text-white/80 transition hover:text-white",
        props.className
      )}
    >
      {props.children}
    </Link>
  );
}

function GlassCard(props: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur",
        props.className
      )}
    >
      {props.children}
    </div>
  );
}

function DeviceFrame(props: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "relative rounded-[36px] border border-white/15 bg-white/5 shadow-[0_44px_140px_rgba(0,0,0,0.65)] backdrop-blur",
        props.className
      )}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[36px] bg-gradient-to-b from-white/12 via-transparent to-transparent" />
      <div className="relative p-3">
        <div className="overflow-hidden rounded-[30px] bg-white shadow-inner">
          <div className="flex items-center gap-1 border-b border-slate-200 bg-slate-50 px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-red-400" />
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <div className="ml-auto text-[11px] font-medium text-slate-500">Ukepenger</div>
          </div>
          <div className="bg-white p-4 md:p-5">{props.children}</div>
        </div>
      </div>
    </div>
  );
}

function DemoHeader(props: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <div className="text-sm font-semibold text-slate-900">{props.title}</div>
      {props.subtitle ? <div className="mt-1 text-xs text-slate-500">{props.subtitle}</div> : null}
    </div>
  );
}

function DemoRow(props: { left: string; right: string; badge?: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5">
      <div className="text-sm font-medium text-slate-800">{props.left}</div>
      <div className="flex items-center gap-2">
        {props.badge ? (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
            {props.badge}
          </span>
        ) : null}
        <div className="text-sm font-semibold text-slate-900">{props.right}</div>
      </div>
    </div>
  );
}

function DemoTasks() {
  return (
    <div>
      <DemoHeader title="Oppgaver" subtitle="Velg oppgaver og send krav" />
      <div className="space-y-2">
        <DemoRow left="Rydde rom" right="+10 kr" />
        <DemoRow left="Tomme oppvaskmaskin" right="+10 kr" />
        <DemoRow left="Gaa tur" right="+5 kr" />
      </div>

      <button className="mt-4 w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-emerald-700">
        Send krav
      </button>

      <div className="mt-3 text-xs text-slate-500">
        Barn sender inn. Forelder godkjenner i innboksen.
      </div>
    </div>
  );
}
function DemoSending() {
  return (
    <div>
      <DemoHeader title="Sender..." subtitle="Registrerer kravet" />
      <div className="mt-8 flex items-center justify-center">
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500 [animation-delay:120ms]" />
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500 [animation-delay:240ms]" />
          <span className="ml-2 text-sm font-medium text-slate-700">Sender krav</span>
        </div>
      </div>
      <div className="mt-8 text-center text-xs text-slate-500">Dette tar et lite sekund...</div>
    </div>
  );
}

function DemoSent() {
  return (
    <div>
      <DemoHeader title="Krav sendt" subtitle="Venter paa godkjenning" />

      <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white">
            <IconCheck className="h-5 w-5" />
          </span>
          <div>
            <div className="text-sm font-semibold text-emerald-900">Ferdig</div>
            <div className="mt-1 text-xs text-emerald-800">
              Kravet er sendt. Forelder kan godkjenne i innboksen.
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
        <div className="text-xs text-slate-500">Status</div>
        <div className="text-sm font-semibold text-slate-900">Venter paa godkjenning</div>
      </div>
    </div>
  );
}

function DemoInboxTease() {
  return (
    <div>
      <DemoHeader title="Innboks" subtitle="Forelder godkjenner" />

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-800">
              N
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">Noah</div>
              <div className="text-xs text-slate-500">Rydde rom</div>
            </div>
          </div>
          <div className="text-sm font-semibold text-slate-900">10 kr</div>
        </div>

        <div className="mt-3 flex gap-2">
          <button className="flex-1 rounded-2xl bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
            Godkjenn
          </button>
          <button className="flex-1 rounded-2xl bg-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-300">
            Avvis
          </button>
        </div>
      </div>
    </div>
  );
}

function PayoutMock() {
  return (
    <div>
      <DemoHeader title="Utbetaling" subtitle="Marker som utbetalt" />
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-baseline justify-between">
          <div className="text-xs text-slate-500">Til gode</div>
          <div className="text-2xl font-semibold text-slate-900">45 kr</div>
        </div>

        <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-3 py-3">
          <div className="text-xs text-slate-500">Metode</div>
          <div className="mt-1 text-sm font-semibold text-slate-900">Kontanter</div>
        </div>

        <button className="mt-4 w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700">
          Utbetal
        </button>
      </div>
    </div>
  );
}

function WishlistMock() {
  const reduceMotion = useReducedMotion();

  return (
    <div>
      <DemoHeader title="Sparemaal" subtitle="Spar til noe du oensker deg" />

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-slate-900">Ny fotball</div>
            <div className="mt-1 text-xs text-slate-500">80 / 250 kr</div>
          </div>
          <div className="rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-800">
            32%
          </div>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
          {reduceMotion ? (
            <div className="h-full w-[32%] bg-emerald-600" />
          ) : (
            <motion.div
              className="h-full bg-emerald-600"
              initial={{ width: 0 }}
              whileInView={{ width: "32%" }}
              viewport={{ once: true, margin: "-20% 0px -20% 0px" }}
              transition={{ duration: 1.1, ease: "easeOut" }}
            />
          )}
        </div>

        <div className="mt-4 space-y-2">
          <DemoRow left="Rydde rom" right="+10 kr" badge="Godkjent" />
          <DemoRow left="Gaa tur" right="+5 kr" badge="Sendt" />
        </div>
      </div>
    </div>
  );
}

type HeroStep = 0 | 1 | 2 | 3;

function HeroDeviceDemo() {
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState<HeroStep>(0);

  useEffect(() => {
    if (reduceMotion) return;

    const schedule: Array<{ step: HeroStep; ms: number }> = [
      { step: 0, ms: 3500 },
      { step: 1, ms: 2000 },
      { step: 2, ms: 3000 },
      { step: 3, ms: 3000 },
    ];

    let idx = 0;
    let t: ReturnType<typeof setTimeout> | null = null;

    const tick = () => {
      const next = schedule[idx];
      setStep(next.step);
      idx = (idx + 1) % schedule.length;
      t = setTimeout(tick, next.ms);
    };

    t = setTimeout(tick, schedule[0].ms);

    return () => {
      if (t) clearTimeout(t);
    };
  }, [reduceMotion]);

  const content = useMemo(() => {
    if (reduceMotion) return <DemoTasks />;

    switch (step) {
      case 0:
        return <DemoTasks />;
      case 1:
        return <DemoSending />;
      case 2:
        return <DemoSent />;
      case 3:
        return <DemoInboxTease />;
      default:
        return <DemoTasks />;
    }
  }, [step, reduceMotion]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={reduceMotion ? "static" : step}
        initial={{ opacity: 0, y: 10, filter: "blur(2px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -8, filter: "blur(2px)" }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        {content}
      </motion.div>
    </AnimatePresence>
  );
}

function StaticPhone(props: { variant: "tasks" | "inbox" | "payout" | "wishlist" }) {
  const content =
    props.variant === "tasks" ? (
      <DemoTasks />
    ) : props.variant === "inbox" ? (
      <DemoInboxTease />
    ) : props.variant === "payout" ? (
      <PayoutMock />
    ) : (
      <WishlistMock />
    );

  return <DeviceFrame className="w-full max-w-[560px]">{content}</DeviceFrame>;
}

function SectionTitle(props: { eyebrow?: string; title: string; desc: string }) {
  return (
    <div>
      {props.eyebrow ? (
        <div className="text-xs font-semibold tracking-[0.22em] text-lime-300/90">{props.eyebrow}</div>
      ) : null}

      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
        {props.title}
      </h2>

      <p className="mt-4 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
        {props.desc}
      </p>
    </div>
  );
}
function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-white">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
            <span className="h-2 w-2 rounded-full bg-lime-300" />
          </span>
          Ukepenger
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <Link href="#how" className="text-sm font-medium text-white/70 hover:text-white">
            Slik funker det
          </Link>
          <Link href="#benefits" className="text-sm font-medium text-white/70 hover:text-white">
            Fordeler
          </Link>
          <Link href="/login" className="text-sm font-medium text-white/70 hover:text-white">
            Logg inn
          </Link>
          <PrimaryButtonLink href="/login" className="px-5 py-2.5 text-sm">
            Kom i gang
          </PrimaryButtonLink>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2 text-white md:hidden"
          onClick={() => setOpen(true)}
          aria-label="Aapne meny"
        >
          <IconMenu className="h-5 w-5" />
        </button>
      </Container>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-50 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
            <motion.div
              className="absolute right-3 top-3 w-[calc(100%-24px)] rounded-3xl border border-white/10 bg-slate-950/95 p-4 shadow-[0_30px_90px_rgba(0,0,0,0.6)] backdrop-blur"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-white">Meny</div>
                <button
                  type="button"
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white"
                  onClick={() => setOpen(false)}
                >
                  Lukk
                </button>
              </div>

              <div className="mt-4 space-y-2">
                <Link
                  href="#how"
                  className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white"
                  onClick={() => setOpen(false)}
                >
                  Slik funker det
                </Link>
                <Link
                  href="#benefits"
                  className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white"
                  onClick={() => setOpen(false)}
                >
                  Fordeler
                </Link>
                <Link
                  href="/login"
                  className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white"
                  onClick={() => setOpen(false)}
                >
                  Logg inn
                </Link>
                <PrimaryButtonLink href="/login" className="w-full">
                  Kom i gang
                </PrimaryButtonLink>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default function LandingClient() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Nav />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950 to-emerald-950" />
        <div className="pointer-events-none absolute -top-44 left-1/2 h-[760px] w-[760px] -translate-x-1/2 rounded-full bg-emerald-400/12 blur-3xl" />
        <div className="pointer-events-none absolute -top-24 left-[8%] h-[520px] w-[520px] rounded-full bg-cyan-400/8 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-52 right-[6%] h-[660px] w-[660px] rounded-full bg-lime-300/6 blur-3xl" />

        <Container className="relative py-24 md:py-32">
          <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold tracking-[0.18em] text-white/80 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-lime-300" />
                FAMILIEAPP
              </div>

              <h1 className="mt-6 max-w-[11ch] text-5xl font-semibold tracking-tight text-white md:text-7xl md:leading-[1.02]">
                Full kontroll paa ukepenger
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/75 md:text-xl">
                Barn registrerer oppgaver. Du godkjenner og betaler.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <PrimaryButtonLink href="/login">Kom i gang</PrimaryButtonLink>
                <SecondaryLink href="#how">
                  Se hvordan det funker <IconArrowRight className="h-4 w-4" />
                </SecondaryLink>
              </div>

              <div className="mt-6 flex justify-center lg:hidden">
                <motion.div
                  className="w-full max-w-[420px]"
                  animate={reduceMotion ? undefined : { y: [0, -10, 0] }}
                  transition={
                    reduceMotion ? undefined : { duration: 6, repeat: Infinity, ease: "easeInOut" }
                  }
                >
                  <DeviceFrame className="w-full">
                    <HeroDeviceDemo />
                  </DeviceFrame>
                </motion.div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white/80 backdrop-blur">
                  <IconCheck className="h-4 w-4 text-lime-300" />
                  Goy for barna
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white/80 backdrop-blur">
                  <IconCheck className="h-4 w-4 text-lime-300" />
                  Mindre mas hjemme
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white/80 backdrop-blur">
                  <IconCheck className="h-4 w-4 text-lime-300" />
                  Full oversikt
                </div>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <motion.div
                className="relative mx-auto w-full max-w-[620px]"
                animate={reduceMotion ? undefined : { y: [0, -10, 0] }}
                transition={
                  reduceMotion ? undefined : { duration: 6, repeat: Infinity, ease: "easeInOut" }
                }
              >
                <DeviceFrame className="w-full">
                  <HeroDeviceDemo />
                </DeviceFrame>
              </motion.div>
            </div>
          </div>
        </Container>
      </section>

      {/* TRUST STRIP */}
      <section className="border-y border-white/8 bg-slate-950/70 backdrop-blur">
        <Container className="py-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white/80">
              <IconCheck className="h-4 w-4 text-lime-300" />
              Enkelt oppsett
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white/80">
              <IconCheck className="h-4 w-4 text-lime-300" />
              Foreldre har full kontroll
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white/80">
              <IconCheck className="h-4 w-4 text-lime-300" />
              Historikk og oversikt
            </div>
          </div>
        </Container>
      </section>

      {/* FEATURE 1 */}
      <section className="bg-gradient-to-b from-emerald-950 to-slate-950">
        <Container className="py-20 md:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <SectionTitle
              eyebrow="BARN"
              title="Barn registrerer oppgaver"
              desc="Barna velger oppgaver og sender inn krav. Du ser alt samlet, uten mas."
            />
            <div className="flex justify-center lg:justify-end">
              <StaticPhone variant="tasks" />
            </div>
          </div>
        </Container>
      </section>
      {/* FEATURE 2 */}
      <section className="bg-gradient-to-b from-slate-950 to-emerald-900/90">
        <Container className="py-20 md:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="order-2 flex justify-center lg:order-1 lg:justify-start">
              <StaticPhone variant="inbox" />
            </div>
            <div className="order-1 lg:order-2">
              <SectionTitle
                eyebrow="FORELDER"
                title="Du godkjenner paa sekunder"
                desc="Krav havner i innboksen. Godkjenn eller avvis med ett trykk."
              />
            </div>
          </div>
        </Container>
      </section>

      {/* FEATURE 3 */}
      <section className="bg-gradient-to-b from-emerald-900/90 to-slate-950">
        <Container className="py-20 md:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <SectionTitle
              eyebrow="UTBETALING"
              title="Utbetal naar det passer"
              desc="Marker utbetaling og hold historikken ryddig. Kontanter, Vipps eller bank."
            />
            <div className="flex justify-center lg:justify-end">
              <StaticPhone variant="payout" />
            </div>
          </div>
        </Container>
      </section>

      {/* BENEFITS */}
      <section id="benefits" className="scroll-mt-24 bg-slate-950">
        <Container className="py-20 md:py-24">
          <div className="max-w-2xl">
            <SectionTitle
              eyebrow="FORDELER"
              title="Premium enkelhet for hele familien"
              desc="Alt du trenger for ukepenger: oversikt, godkjenning og historikk."
            />
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <GlassCard>
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-lime-400/15 text-lime-200 ring-1 ring-lime-300/20">
                  <IconCheck className="h-5 w-5" />
                </span>
                <div className="text-base font-semibold text-white">Kontroll og oversikt</div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-white/70">
                Se hva som er sendt, godkjent og utbetalt. Null rot.
              </p>
            </GlassCard>

            <GlassCard>
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-lime-400/15 text-lime-200 ring-1 ring-lime-300/20">
                  <IconCheck className="h-5 w-5" />
                </span>
                <div className="text-base font-semibold text-white">Mindre mas</div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-white/70">
                Barna sender krav i appen. Du godkjenner naar det passer.
              </p>
            </GlassCard>

            <GlassCard>
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-lime-400/15 text-lime-200 ring-1 ring-lime-300/20">
                  <IconCheck className="h-5 w-5" />
                </span>
                <div className="text-base font-semibold text-white">Mobil-first</div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-white/70">
                Bygd for mobil. Store knapper. Rask flyt.
              </p>
            </GlassCard>
          </div>
        </Container>
      </section>

      {/* WISHLIST / EMOTIONAL */}
      <section className="bg-gradient-to-b from-slate-950 to-emerald-950">
        <Container className="py-20 md:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <SectionTitle
              eyebrow="SPARING"
              title="Spar til noe du oensker deg"
              desc="Onskeliste og sparemaal gir barna motivasjon. Ukepenger faar en tydelig mening."
            />
            <div className="flex justify-center lg:justify-end">
              <StaticPhone variant="wishlist" />
            </div>
          </div>
        </Container>
      </section>

      {/* FAMILY */}
      <section className="bg-slate-950">
        <Container className="py-20 md:py-24">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <SectionTitle
                eyebrow="FAMILIE"
                title="For familier som vil ha kontroll"
                desc="En enkel app som gjor ukepenger ryddig. Bygd for hverdagen."
              />
              <div className="mt-8">
                <GlassCard className="p-5">
                  <div className="text-sm font-semibold text-white">Tipset som funker</div>
                  <p className="mt-2 text-sm text-white/70">
                    Start med 3-5 oppgaver, godkjenn paa mobilen, og utbetal fast en gang i uka.
                  </p>
                </GlassCard>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-tr from-emerald-500/10 via-white/5 to-cyan-500/10 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
              <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-400/15 blur-3xl" />
              <div className="pointer-events-none absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="text-xs font-semibold tracking-[0.22em] text-lime-300/90">BILDEPLASSHOLDER</div>
                <div className="mt-3 text-lg font-semibold text-white">Bytt inn et ekte familie-bilde</div>
                <p className="mt-2 text-sm text-white/70">
                  Ett ekte bilde er ofte nok for aa faa mer Greenlight-foelelse.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="h-28 rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-transparent" />
                  <div className="h-28 rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* HOW */}
      <section id="how" className="scroll-mt-24 bg-gradient-to-b from-emerald-950 to-slate-950">
        <Container className="py-20 md:py-24">
          <div className="max-w-2xl">
            <SectionTitle
              eyebrow="SLIK FUNKER DET"
              title="Tre enkle steg"
              desc="Hold flyten enkel: oppgaver, krav, godkjenning og utbetaling."
            />
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                n: "1",
                t: "Velg oppgaver",
                d: "Barna velger oppgaver og registrerer hva de har gjort.",
              },
              {
                n: "2",
                t: "Barn sender krav",
                d: "Krav sendes inn og havner i innboksen din.",
              },
              {
                n: "3",
                t: "Du godkjenner og utbetaler",
                d: "Godkjenn paa mobilen og marker utbetaling naar det passer.",
              },
            ].map((item) => (
              <GlassCard key={item.n}>
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lime-400/15 text-lime-200 ring-1 ring-lime-300/20">
                    <span className="text-base font-semibold">{item.n}</span>
                  </div>
                  <div>
                    <div className="text-base font-semibold text-white">{item.t}</div>
                    <p className="mt-2 text-sm leading-relaxed text-white/70">{item.d}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </Container>
      </section>

      {/* FINAL CTA */}
      <section className="bg-slate-950">
        <Container className="py-16 md:py-20">
          <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-slate-950 via-slate-950 to-emerald-950 p-8 shadow-[0_30px_90px_rgba(0,0,0,0.55)] md:p-12">
            <div className="pointer-events-none absolute -top-24 right-10 h-72 w-72 rounded-full bg-lime-300/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-emerald-400/15 blur-3xl" />

            <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
              <div>
                <div className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
                  Kom i gang paa 2 minutter
                </div>
                <div className="mt-2 text-sm text-white/70">Gratis aa bruke.</div>
              </div>

              <PrimaryButtonLink href="/login" className="px-7 py-3 text-sm">
                Kom i gang
              </PrimaryButtonLink>
            </div>
          </div>

          <div className="mt-10 text-center text-xs text-white/40">
            Ukepenger - familieapp for oppgaver og ukepenger.
          </div>
        </Container>
      </section>
    </div>
  );
}
