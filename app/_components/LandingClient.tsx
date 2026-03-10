"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

function cn(...parts: Array<string | undefined | null | false>) {
  return parts.filter(Boolean).join(" ");
}

function Container(props: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-6", props.className)}>
      {props.children}
    </div>
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

function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl">
      <Container className="flex h-14 items-center justify-between">
        <Link href="/" className="text-lg font-semibold text-foreground">
          Ukepenger
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link href="#demo" className="text-sm text-muted-foreground hover:text-foreground transition">
            Demo
          </Link>
          <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition">
            Funksjoner
          </Link>
        </nav>

        <div className="hidden items-center gap-6 md:flex">
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition">
            Logg inn
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-accent-foreground transition hover:bg-primary-dark"
          >
            Kom i gang
          </Link>
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-foreground md:hidden"
          onClick={() => setOpen(true)}
          aria-label="Apne meny"
        >
          <IconMenu className="h-5 w-5" />
        </button>
      </Container>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 bg-background md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex h-14 items-center justify-between px-6">
              <span className="text-lg font-semibold text-foreground">Ukepenger</span>
              <button
                type="button"
                className="rounded-lg p-2 text-foreground"
                onClick={() => setOpen(false)}
              >
                <IconClose className="h-5 w-5" />
              </button>
            </div>

            <nav className="mt-8 space-y-1 px-6">
              <Link
                href="#demo"
                className="block py-3 text-2xl font-medium text-foreground"
                onClick={() => setOpen(false)}
              >
                Demo
              </Link>
              <Link
                href="#features"
                className="block py-3 text-2xl font-medium text-foreground"
                onClick={() => setOpen(false)}
              >
                Funksjoner
              </Link>
              <Link
                href="/login"
                className="block py-3 text-2xl font-medium text-foreground"
                onClick={() => setOpen(false)}
              >
                Logg inn
              </Link>
            </nav>

            <div className="absolute bottom-12 left-6 right-6">
              <Link
                href="/login"
                className="block w-full rounded-full bg-primary py-4 text-center text-base font-medium text-accent-foreground"
              >
                Kom i gang
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// Continuous video-style demo
function PhoneDemo() {
  const reduceMotion = useReducedMotion();
  const [scrollY, setScrollY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll animation
  useEffect(() => {
    if (reduceMotion) return;

    const totalHeight = 1200; // Total scroll height of demo content
    const duration = 12000; // 12 seconds per loop
    let startTime: number | null = null;
    let animationId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = (elapsed % duration) / duration;
      
      // Smooth easing with pause at key points
      const eased = smoothScrollEasing(progress);
      setScrollY(eased * totalHeight);
      
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [reduceMotion]);

  // Custom easing that pauses at key screens
  function smoothScrollEasing(t: number): number {
    // Create pause points at 0.2, 0.5, 0.8
    const pausePoints = [0.2, 0.5, 0.8];
    const pauseDuration = 0.08;
    
    for (const point of pausePoints) {
      if (t >= point - pauseDuration / 2 && t <= point + pauseDuration / 2) {
        return point;
      }
    }
    
    return t;
  }

  return (
    <div className="relative mx-auto w-[280px] sm:w-[320px]">
      {/* Phone frame */}
      <div className="relative rounded-[44px] bg-foreground/90 p-[10px] shadow-2xl shadow-black/40">
        {/* Dynamic Island */}
        <div className="absolute left-1/2 top-[18px] z-20 h-[28px] w-[90px] -translate-x-1/2 rounded-full bg-black" />
        
        {/* Screen */}
        <div 
          ref={containerRef}
          className="relative h-[540px] overflow-hidden rounded-[34px] bg-background sm:h-[600px]"
        >
          {/* Scrolling content */}
          <motion.div
            className="absolute inset-x-0 top-0"
            style={{ y: -scrollY }}
          >
            {/* Screen 1: Task list */}
            <div className="min-h-[600px] p-5 pt-14">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-foreground">Oppgaver</h3>
                <p className="text-sm text-muted-foreground">Velg det du har gjort</p>
              </div>

              <div className="space-y-3">
                {[
                  { task: "Rydde rommet", amount: 15, done: true },
                  { task: "Tomme oppvaskmaskin", amount: 10, done: true },
                  { task: "Ga tur med hunden", amount: 20, done: false },
                  { task: "Stovsuging", amount: 25, done: false },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className={cn(
                      "flex items-center justify-between rounded-2xl p-4 transition-colors",
                      item.done ? "bg-primary/10" : "bg-muted"
                    )}
                    initial={false}
                    animate={{ 
                      scale: item.done ? 1 : 1,
                      backgroundColor: item.done ? "rgba(163, 230, 53, 0.1)" : "rgba(30, 41, 59, 1)"
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors",
                        item.done ? "border-primary bg-primary" : "border-muted-foreground"
                      )}>
                        {item.done && <IconCheck className="h-4 w-4 text-accent-foreground" />}
                      </div>
                      <span className="text-sm font-medium text-foreground">{item.task}</span>
                    </div>
                    <span className="text-sm font-semibold text-primary">+{item.amount} kr</span>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl bg-muted p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Totalt denne uka</span>
                  <span className="text-lg font-bold text-foreground">25 kr</span>
                </div>
              </div>

              <button className="mt-6 w-full rounded-2xl bg-primary py-4 text-base font-semibold text-accent-foreground">
                Send krav
              </button>
            </div>

            {/* Screen 2: Pending approval */}
            <div className="min-h-[600px] p-5 pt-14">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-foreground">Krav sendt</h3>
                <p className="text-sm text-muted-foreground">Venter pa godkjenning</p>
              </div>

              <div className="flex flex-col items-center justify-center py-12">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
                  <motion.div
                    className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                </div>
                <p className="mt-6 text-center text-sm text-muted-foreground">
                  Kravet ditt er sendt til godkjenning
                </p>
              </div>

              <div className="mt-8 space-y-3">
                <div className="rounded-2xl bg-muted p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Belop</span>
                    <span className="font-semibold text-foreground">25 kr</span>
                  </div>
                </div>
                <div className="rounded-2xl bg-muted p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <span className="text-sm font-medium text-amber-400">Venter</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Screen 3: Parent approval view */}
            <div className="min-h-[600px] p-5 pt-14">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-foreground">Innboks</h3>
                <p className="text-sm text-muted-foreground">Krav som venter</p>
              </div>

              <div className="rounded-2xl bg-muted p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-accent-foreground">
                    N
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">Noah</p>
                    <p className="text-sm text-muted-foreground">2 oppgaver fullfort</p>
                  </div>
                  <span className="text-lg font-bold text-foreground">25 kr</span>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between rounded-xl bg-background/50 px-3 py-2">
                    <span className="text-sm text-foreground">Rydde rommet</span>
                    <span className="text-sm text-primary">+15 kr</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-background/50 px-3 py-2">
                    <span className="text-sm text-foreground">Tomme oppvaskmaskin</span>
                    <span className="text-sm text-primary">+10 kr</span>
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <button className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-accent-foreground">
                    Godkjenn
                  </button>
                  <button className="flex-1 rounded-xl bg-foreground/10 py-3 text-sm font-semibold text-foreground">
                    Avvis
                  </button>
                </div>
              </div>
            </div>

            {/* Screen 4: Approved + balance */}
            <div className="min-h-[600px] p-5 pt-14">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-foreground">Saldo</h3>
                <p className="text-sm text-muted-foreground">Noahs konto</p>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-primary to-primary-dark p-6">
                <p className="text-sm text-accent-foreground/70">Tilgjengelig</p>
                <p className="mt-1 text-4xl font-bold text-accent-foreground">125 kr</p>
              </div>

              <div className="mt-6">
                <p className="mb-3 text-sm font-medium text-muted-foreground">Siste aktivitet</p>
                <div className="space-y-2">
                  {[
                    { text: "Ukepenger godkjent", amount: "+25 kr", time: "Na" },
                    { text: "Handlet i kiosk", amount: "-30 kr", time: "I gar" },
                    { text: "Ukepenger godkjent", amount: "+35 kr", time: "Forrige uke" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl bg-muted px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.text}</p>
                        <p className="text-xs text-muted-foreground">{item.time}</p>
                      </div>
                      <span className={cn(
                        "text-sm font-semibold",
                        item.amount.startsWith("+") ? "text-primary" : "text-foreground"
                      )}>
                        {item.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Gradient overlays for smooth transitions */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-background to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent" />
        </div>
      </div>

      {/* Reflection/glow effect */}
      <div className="absolute -inset-4 -z-10 rounded-[60px] bg-primary/20 blur-3xl" />
    </div>
  );
}

function FeatureItem(props: { title: string; description: string }) {
  return (
    <div className="text-center">
      <h3 className="text-lg font-semibold text-foreground">{props.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{props.description}</p>
    </div>
  );
}

export default function LandingClient() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />

      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              <span className="block text-balance">Ukepenger.</span>
              <span className="block text-balance text-primary">Enkelt for hele familien.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Barn registrerer oppgaver. Du godkjenner og betaler. Alt pa ett sted.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-base font-semibold text-accent-foreground transition hover:bg-primary-dark"
              >
                Kom i gang
                <IconArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="#demo"
                className="inline-flex items-center justify-center rounded-full border border-border px-8 py-4 text-base font-semibold text-foreground transition hover:bg-muted"
              >
                Se demo
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Demo section */}
      <section id="demo" className="scroll-mt-20 py-20 md:py-32">
        <Container>
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Se hvordan det fungerer
            </h2>
            <p className="mt-3 text-muted-foreground">
              Fra oppgave til godkjenning pa sekunder
            </p>
          </div>

          <div className="mt-16">
            <PhoneDemo />
          </div>
        </Container>
      </section>

      {/* Features - minimal */}
      <section id="features" className="scroll-mt-20 border-t border-border py-20 md:py-32">
        <Container>
          <div className="grid gap-12 md:grid-cols-3 md:gap-8">
            <FeatureItem
              title="Oppgaveliste"
              description="Sett opp oppgaver med belonning. Barna velger og registrerer selv hva de har gjort."
            />
            <FeatureItem
              title="Enkel godkjenning"
              description="Se alle krav i innboksen. Godkjenn med ett trykk nar oppgavene er gjort."
            />
            <FeatureItem
              title="Full oversikt"
              description="Hold styr pa saldo, utbetalinger og sparemal for alle barna."
            />
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="border-t border-border py-20 md:py-32">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Klar til a komme i gang?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Gratis a bruke. Ingen kredittkort nodvendig.
            </p>
            <div className="mt-10">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-base font-semibold text-accent-foreground transition hover:bg-primary-dark"
              >
                Start gratis
                <IconArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Footer - minimal */}
      <footer className="border-t border-border py-8">
        <Container>
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <span className="text-sm text-muted-foreground">Ukepenger</span>
            <span className="text-sm text-muted-foreground">Familie-appen for oppgaver og ukepenger</span>
          </div>
        </Container>
      </footer>
    </div>
  );
}
