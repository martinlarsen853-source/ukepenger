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

function IconClose(props: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={props.className}>
      <path
        d="M5 5l10 10M15 5l-10 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconStar(props: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className={props.className}>
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function PrimaryButton(props: {
  href?: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const classes = cn(
    "inline-flex items-center justify-center rounded-full bg-primary px-7 py-4 text-base font-semibold text-accent-foreground shadow-lg transition hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
    props.className
  );

  if (props.href) {
    return (
      <Link href={props.href} className={classes}>
        {props.children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={props.onClick} className={classes}>
      {props.children}
    </button>
  );
}

function SecondaryButton(props: {
  href?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const classes = cn(
    "inline-flex items-center justify-center rounded-full border-2 border-foreground/20 bg-transparent px-7 py-4 text-base font-semibold text-foreground transition hover:border-foreground/40 hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2",
    props.className
  );

  if (props.href) {
    return (
      <Link href={props.href} className={classes}>
        {props.children}
      </Link>
    );
  }

  return (
    <button type="button" className={classes}>
      {props.children}
    </button>
  );
}

function DeviceFrame(props: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "relative rounded-[40px] bg-foreground p-2 shadow-2xl",
        props.className
      )}
    >
      <div className="absolute left-1/2 top-4 h-6 w-24 -translate-x-1/2 rounded-full bg-foreground" />
      <div className="relative overflow-hidden rounded-[32px] bg-background">
        <div className="pt-8">{props.children}</div>
      </div>
    </div>
  );
}

function DemoHeader(props: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4 px-4">
      <div className="text-base font-semibold text-foreground">{props.title}</div>
      {props.subtitle ? <div className="mt-1 text-sm text-muted-foreground">{props.subtitle}</div> : null}
    </div>
  );
}

function DemoRow(props: { left: string; right: string; badge?: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-muted px-4 py-3">
      <div className="text-sm font-medium text-foreground">{props.left}</div>
      <div className="flex items-center gap-2">
        {props.badge ? (
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
            {props.badge}
          </span>
        ) : null}
        <div className="text-sm font-semibold text-foreground">{props.right}</div>
      </div>
    </div>
  );
}

function DemoTasks() {
  return (
    <div className="p-4">
      <DemoHeader title="Oppgaver" subtitle="Velg oppgaver og send krav" />
      <div className="space-y-2">
        <DemoRow left="Rydde rom" right="+10 kr" />
        <DemoRow left="Tomme oppvaskmaskin" right="+10 kr" />
        <DemoRow left="Ga tur med hunden" right="+15 kr" />
      </div>

      <button className="mt-4 w-full rounded-2xl bg-primary px-4 py-3.5 text-base font-semibold text-accent-foreground shadow-md hover:bg-primary-dark">
        Send krav
      </button>
    </div>
  );
}

function DemoSending() {
  return (
    <div className="p-4">
      <DemoHeader title="Sender..." subtitle="Registrerer kravet" />
      <div className="mt-12 flex items-center justify-center">
        <div className="flex items-center gap-2 rounded-full bg-muted px-5 py-3">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary" />
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary [animation-delay:120ms]" />
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary [animation-delay:240ms]" />
          <span className="ml-2 text-sm font-medium text-foreground">Sender krav</span>
        </div>
      </div>
      <div className="mt-12 text-center text-sm text-muted-foreground">Dette tar et lite sekund...</div>
    </div>
  );
}

function DemoSent() {
  return (
    <div className="p-4">
      <DemoHeader title="Krav sendt" subtitle="Venter pa godkjenning" />

      <div className="mt-4 rounded-2xl bg-primary/10 p-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-accent-foreground">
            <IconCheck className="h-5 w-5" />
          </span>
          <div>
            <div className="text-sm font-semibold text-foreground">Ferdig!</div>
            <div className="mt-1 text-sm text-muted-foreground">
              Kravet er sendt. Forelder kan godkjenne.
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-muted px-4 py-3">
        <div className="text-xs text-muted-foreground">Status</div>
        <div className="text-sm font-semibold text-foreground">Venter pa godkjenning</div>
      </div>
    </div>
  );
}

function DemoInbox() {
  return (
    <div className="p-4">
      <DemoHeader title="Innboks" subtitle="Godkjenn krav fra barna" />

      <div className="rounded-2xl bg-muted p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-base font-semibold text-accent-foreground">
              N
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">Noah</div>
              <div className="text-xs text-muted-foreground">Rydde rom</div>
            </div>
          </div>
          <div className="text-base font-semibold text-foreground">10 kr</div>
        </div>

        <div className="mt-4 flex gap-2">
          <button className="flex-1 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-accent-foreground hover:bg-primary-dark">
            Godkjenn
          </button>
          <button className="flex-1 rounded-2xl bg-foreground/10 px-4 py-3 text-sm font-semibold text-foreground hover:bg-foreground/20">
            Avvis
          </button>
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
        return <DemoInbox />;
      default:
        return <DemoTasks />;
    }
  }, [step, reduceMotion]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={reduceMotion ? "static" : step}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        {content}
      </motion.div>
    </AnimatePresence>
  );
}

function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-foreground">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-primary">
            <span className="h-2 w-2 rounded-full bg-accent-foreground" />
          </span>
          Ukepenger
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link href="#how" className="text-sm font-medium text-muted-foreground hover:text-foreground transition">
            Slik funker det
          </Link>
          <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition">
            Funksjoner
          </Link>
          <Link href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition">
            Tilbakemeldinger
          </Link>
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition">
            Logg inn
          </Link>
          <PrimaryButton href="/login" className="px-5 py-2.5 text-sm">
            Kom i gang
          </PrimaryButton>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-xl p-2 text-foreground md:hidden"
          onClick={() => setOpen(true)}
          aria-label="Apne meny"
        >
          <IconMenu className="h-6 w-6" />
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
            <div className="absolute inset-0 bg-foreground/20" onClick={() => setOpen(false)} />
            <motion.div
              className="absolute inset-x-4 top-4 rounded-3xl bg-background p-6 shadow-2xl"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-lg text-foreground">Meny</span>
                <button
                  type="button"
                  className="rounded-xl p-2 text-foreground hover:bg-muted"
                  onClick={() => setOpen(false)}
                >
                  <IconClose className="h-5 w-5" />
                </button>
              </div>

              <nav className="mt-6 space-y-2">
                <Link
                  href="#how"
                  className="block rounded-2xl px-4 py-3 text-base font-medium text-foreground hover:bg-muted"
                  onClick={() => setOpen(false)}
                >
                  Slik funker det
                </Link>
                <Link
                  href="#features"
                  className="block rounded-2xl px-4 py-3 text-base font-medium text-foreground hover:bg-muted"
                  onClick={() => setOpen(false)}
                >
                  Funksjoner
                </Link>
                <Link
                  href="#testimonials"
                  className="block rounded-2xl px-4 py-3 text-base font-medium text-foreground hover:bg-muted"
                  onClick={() => setOpen(false)}
                >
                  Tilbakemeldinger
                </Link>
                <Link
                  href="/login"
                  className="block rounded-2xl px-4 py-3 text-base font-medium text-foreground hover:bg-muted"
                  onClick={() => setOpen(false)}
                >
                  Logg inn
                </Link>
              </nav>

              <div className="mt-6">
                <PrimaryButton href="/login" className="w-full">
                  Kom i gang
                </PrimaryButton>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

function StatCard(props: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold text-primary md:text-4xl">{props.value}</div>
      <div className="mt-1 text-sm text-muted-foreground">{props.label}</div>
    </div>
  );
}

function TestimonialCard(props: {
  quote: string;
  name: string;
  role: string;
}) {
  return (
    <div className="rounded-3xl bg-muted p-6">
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <IconStar key={i} className="h-5 w-5 text-amber-400" />
        ))}
      </div>
      <p className="mt-4 text-base leading-relaxed text-foreground">{props.quote}</p>
      <div className="mt-4">
        <div className="font-semibold text-foreground">{props.name}</div>
        <div className="text-sm text-muted-foreground">{props.role}</div>
      </div>
    </div>
  );
}

function FeatureCard(props: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 transition hover:shadow-lg">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        {props.icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-card-foreground">{props.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{props.description}</p>
    </div>
  );
}

function IconTasks(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={props.className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
}

function IconWallet(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={props.className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  );
}

function IconTarget(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={props.className}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function IconFamily(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={props.className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

export default function LandingClient() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-light/50 to-background">
        <Container className="relative py-12 md:py-20">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <IconStar key={i} className="h-4 w-4 text-amber-400" />
                  ))}
                </div>
                Elsket av norske familier
              </div>

              <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
                <span className="block">Ukepenger for barn.</span>
                <span className="block text-primary">Familie-appen som funker.</span>
              </h1>

              <p className="mt-6 text-lg leading-relaxed text-muted-foreground md:text-xl">
                Barn registrerer oppgaver. Du godkjenner og betaler. Enkelt, oversiktlig og motiverende for hele familien.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <PrimaryButton href="/login">
                  Kom i gang gratis
                  <IconArrowRight className="ml-2 h-5 w-5" />
                </PrimaryButton>
                <SecondaryButton href="#how">
                  Se hvordan det funker
                </SecondaryButton>
              </div>
            </div>

            <div className="relative flex justify-center lg:justify-end">
              <motion.div
                className="relative w-full max-w-[320px]"
                animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
                transition={
                  reduceMotion ? undefined : { duration: 5, repeat: Infinity, ease: "easeInOut" }
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

      {/* STATS */}
      <section className="border-y border-border bg-background py-10">
        <Container>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <StatCard value="1000+" label="Familier bruker appen" />
            <StatCard value="50k+" label="Oppgaver fullfort" />
            <StatCard value="500k kr" label="Utbetalt til barn" />
            <StatCard value="4.9" label="App Store rating" />
          </div>
        </Container>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="scroll-mt-20 bg-background py-16 md:py-24">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Slik funker det
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Tre enkle steg til bedre oversikt over ukepenger
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Opprett oppgaver",
                description: "Legg inn oppgaver med belonning. Rydde rom, gå tur, tomme oppvaskmaskinen - du bestemmer.",
              },
              {
                step: "2",
                title: "Barn sender krav",
                description: "Barna registrerer oppgavene de har gjort og sender inn krav direkte i appen.",
              },
              {
                step: "3",
                title: "Du godkjenner",
                description: "Se alle krav i innboksen din. Godkjenn med ett trykk og marker utbetaling når det passer.",
              },
            ].map((item) => (
              <div key={item.step} className="relative rounded-3xl bg-muted p-6">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-accent-foreground">
                  {item.step}
                </div>
                <h3 className="mt-4 text-xl font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* FEATURES */}
      <section id="features" className="scroll-mt-20 bg-muted py-16 md:py-24">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Alt du trenger for ukepenger
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Bygd for norske familier som vil ha kontroll og oversikt
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<IconTasks className="h-6 w-6" />}
              title="Oppgaveliste"
              description="Sett opp oppgaver med belonning. Barna velger og registrerer selv."
            />
            <FeatureCard
              icon={<IconWallet className="h-6 w-6" />}
              title="Enkel utbetaling"
              description="Hold oversikt over hva som er til gode og marker utbetaling."
            />
            <FeatureCard
              icon={<IconTarget className="h-6 w-6" />}
              title="Sparemal"
              description="Barna kan sette opp sparemal og se fremgangen mot det de onsker seg."
            />
            <FeatureCard
              icon={<IconFamily className="h-6 w-6" />}
              title="Hele familien"
              description="Inviter alle barna og hold styr pa alles oppgaver og utbetalinger."
            />
          </div>
        </Container>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="scroll-mt-20 bg-background py-16 md:py-24">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Norske familier elsker Ukepenger
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Se hva andre foreldre sier om appen
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <TestimonialCard
              quote="Endelig en app som gjor ukepenger enkelt! Barna synes det er goy a registrere oppgaver, og jeg slipper a huske hva de har gjort."
              name="Maria K."
              role="Mamma til 3"
            />
            <TestimonialCard
              quote="Barna laerer verdien av arbeid og penger pa en morsom mate. Sparemalet er genial - sjonnen sparer til ny fotball!"
              name="Erik S."
              role="Pappa til 2"
            />
            <TestimonialCard
              quote="Mye mindre mas om penger na. Alt er oversiktlig i appen, og ungene tar mer ansvar for oppgavene sine."
              name="Anne L."
              role="Mamma til 2"
            />
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16 md:py-20">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-accent-foreground md:text-4xl">
              Kom i gang pa 2 minutter
            </h2>
            <p className="mt-4 text-lg text-accent-foreground/80">
              Gratis a bruke. Ingen kredittkort nodvendig.
            </p>
            <div className="mt-8">
              <PrimaryButton
                href="/login"
                className="bg-accent-foreground text-primary hover:bg-accent-foreground/90"
              >
                Start gratis na
                <IconArrowRight className="ml-2 h-5 w-5" />
              </PrimaryButton>
            </div>
          </div>
        </Container>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border bg-background py-12">
        <Container>
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2 font-bold text-lg text-foreground">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-primary">
                <span className="h-2 w-2 rounded-full bg-accent-foreground" />
              </span>
              Ukepenger
            </div>
            <div className="text-sm text-muted-foreground">
              Familie-appen for oppgaver og ukepenger
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
}
