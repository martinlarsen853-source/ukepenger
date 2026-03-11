"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

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
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-foreground">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary">
            <span className="text-sm font-bold text-accent-foreground">U</span>
          </span>
          Ukepenger
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
            Funksjoner
          </Link>
        </nav>

        <div className="hidden items-center gap-6 md:flex">
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition">
            Logg inn
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-accent-foreground transition-all duration-300 hover:bg-primary-dark hover:scale-105"
          >
            Kom i gang
          </Link>
        </div>

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-xl text-foreground md:hidden"
          onClick={() => setOpen(true)}
          aria-label="Åpne meny"
        >
          <IconMenu className="h-6 w-6" />
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
            <div className="flex h-16 items-center justify-between px-6">
              <span className="flex items-center gap-2 text-xl font-bold text-foreground">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary">
                  <span className="text-sm font-bold text-accent-foreground">U</span>
                </span>
                Ukepenger
              </span>
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-xl text-foreground"
                onClick={() => setOpen(false)}
              >
                <IconClose className="h-6 w-6" />
              </button>
            </div>

            <nav className="mt-8 space-y-1 px-6">
              <Link
                href="#features"
                className="block py-4 text-2xl font-semibold text-foreground"
                onClick={() => setOpen(false)}
              >
                Funksjoner
              </Link>
              <Link
                href="/login"
                className="block py-4 text-2xl font-semibold text-foreground"
                onClick={() => setOpen(false)}
              >
                Logg inn
              </Link>
            </nav>

            <div className="absolute bottom-12 left-6 right-6">
              <Link
                href="/login"
                className="flex h-14 w-full items-center justify-center rounded-2xl bg-primary text-base font-semibold text-accent-foreground"
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

// Smooth cinematic phone demo with scene transitions
function PhoneDemo() {
  const reduceMotion = useReducedMotion();
  const [currentScene, setCurrentScene] = useState(0);
  
  const scenes = [
    "tasks",      // Child sees task list
    "complete",   // Child completes tasks
    "send",       // Child sends request
    "parent",     // Parent sees inbox
    "approve",    // Parent approves
    "balance",    // Child sees updated balance
    "wishlist",   // Child sees wishlist
  ];

  useEffect(() => {
    if (reduceMotion) return;
    
    const interval = setInterval(() => {
      setCurrentScene((prev) => (prev + 1) % scenes.length);
    }, 3500);
    
    return () => clearInterval(interval);
  }, [reduceMotion, scenes.length]);

  return (
    <div className="relative mx-auto w-[300px] sm:w-[340px]">
      {/* Phone frame */}
      <div className="relative rounded-[52px] bg-gradient-to-b from-zinc-700 to-zinc-900 p-[12px] shadow-2xl shadow-black/50">
        {/* Side buttons */}
        <div className="absolute -left-[2px] top-[100px] h-8 w-[3px] rounded-l-sm bg-zinc-700" />
        <div className="absolute -left-[2px] top-[150px] h-14 w-[3px] rounded-l-sm bg-zinc-700" />
        <div className="absolute -left-[2px] top-[200px] h-14 w-[3px] rounded-l-sm bg-zinc-700" />
        <div className="absolute -right-[2px] top-[140px] h-20 w-[3px] rounded-r-sm bg-zinc-700" />
        
        {/* Inner bezel */}
        <div className="rounded-[40px] bg-black p-[2px]">
          {/* Dynamic Island */}
          <div className="absolute left-1/2 top-[22px] z-20 h-[32px] w-[100px] -translate-x-1/2 rounded-full bg-black" />
          
          {/* Screen */}
          <div className="relative h-[580px] overflow-hidden rounded-[38px] bg-background sm:h-[640px]">
            <AnimatePresence mode="wait">
              {currentScene === 0 && (
                <SceneTaskList key="tasks" />
              )}
              {currentScene === 1 && (
                <SceneTasksComplete key="complete" />
              )}
              {currentScene === 2 && (
                <SceneSendRequest key="send" />
              )}
              {currentScene === 3 && (
                <SceneParentInbox key="parent" />
              )}
              {currentScene === 4 && (
                <SceneApproved key="approve" />
              )}
              {currentScene === 5 && (
                <SceneBalance key="balance" />
              )}
              {currentScene === 6 && (
                <SceneWishlist key="wishlist" />
              )}
            </AnimatePresence>

            {/* Status bar */}
            <div className="absolute inset-x-0 top-0 z-10 flex h-12 items-center justify-between px-8 pt-2">
              <span className="text-xs font-semibold text-foreground">9:41</span>
              <div className="flex items-center gap-1.5">
                <div className="flex gap-0.5">
                  <div className="h-2.5 w-1 rounded-sm bg-foreground" />
                  <div className="h-2.5 w-1 rounded-sm bg-foreground" />
                  <div className="h-2.5 w-1 rounded-sm bg-foreground/60" />
                  <div className="h-2.5 w-1 rounded-sm bg-foreground/30" />
                </div>
                <span className="text-xs text-foreground">5G</span>
                <div className="flex h-3 w-6 items-center rounded-sm border border-foreground/50 px-0.5">
                  <div className="h-1.5 w-3 rounded-sm bg-foreground" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Glow effect */}
      <div className="absolute -inset-8 -z-10 rounded-[80px] bg-primary/15 blur-3xl" />
      
      {/* Scene indicator */}
      <div className="mt-8 flex justify-center gap-2">
        {scenes.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentScene(i)}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              i === currentScene ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30"
            )}
          />
        ))}
      </div>
    </div>
  );
}

// Scene components with smooth cinematic animations
const sceneTransition = {
  initial: { opacity: 0, y: 30, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.98 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }
};

function SceneTaskList() {
  return (
    <motion.div {...sceneTransition} className="h-full p-5 pt-16">
      {/* Profile header */}
      <div className="flex items-center gap-3 rounded-2xl bg-card p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20 text-2xl">
          🐯
        </div>
        <div>
          <p className="font-bold text-foreground">Evelina</p>
          <p className="text-sm text-muted-foreground">Velg en oppgave og trykk send.</p>
        </div>
      </div>

      {/* Balance card */}
      <div className="mt-4 rounded-2xl bg-card p-4">
        <p className="text-sm text-muted-foreground">Saldo totalt: <span className="font-bold text-foreground">25.00 kr</span></p>
        <p className="text-xs text-muted-foreground">Venter: 0.00 kr • Til gode: 25.00 kr</p>
      </div>

      {/* Tasks */}
      <div className="mt-4 space-y-3">
        <TaskCard 
          title="Lage mat" 
          amount="2.00" 
          gradient="from-blue-500 to-cyan-400"
        />
        <TaskCard 
          title="OPPVASKMASKIN" 
          amount="5.00" 
          gradient="from-green-500 to-emerald-400"
        />
        <TaskCard 
          title="Rydde av bordet" 
          amount="2.00" 
          gradient="from-orange-500 to-amber-400"
        />
      </div>
    </motion.div>
  );
}

function TaskCard(props: { title: string; amount: string; gradient: string; selected?: boolean }) {
  return (
    <motion.div 
      className={cn(
        "rounded-2xl bg-gradient-to-br p-5",
        props.gradient,
        props.selected && "ring-2 ring-white ring-offset-2 ring-offset-background"
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <p className="font-bold text-white">{props.title}</p>
      <p className="text-2xl font-bold text-white">{props.amount} kr</p>
      <p className="mt-1 text-sm text-white/80">Trykk for å sende krav</p>
    </motion.div>
  );
}

function SceneTasksComplete() {
  return (
    <motion.div {...sceneTransition} className="h-full p-5 pt-16">
      <div className="flex items-center gap-3 rounded-2xl bg-card p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20 text-2xl">
          🐯
        </div>
        <div>
          <p className="font-bold text-foreground">Evelina</p>
          <p className="text-sm text-muted-foreground">2 oppgaver valgt</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <motion.div 
          className="rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 p-5 ring-2 ring-primary ring-offset-2 ring-offset-background"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-white">Lage mat</p>
              <p className="text-2xl font-bold text-white">2.00 kr</p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
              <IconCheck className="h-5 w-5 text-blue-500" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="rounded-2xl bg-gradient-to-br from-green-500 to-emerald-400 p-5 ring-2 ring-primary ring-offset-2 ring-offset-background"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-white">OPPVASKMASKIN</p>
              <p className="text-2xl font-bold text-white">5.00 kr</p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
              <IconCheck className="h-5 w-5 text-green-500" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-6 rounded-2xl bg-card p-4">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Totalt</span>
          <span className="text-xl font-bold text-foreground">7.00 kr</span>
        </div>
      </div>

      <motion.button 
        className="mt-4 w-full rounded-2xl bg-primary py-4 text-base font-bold text-accent-foreground"
        whileTap={{ scale: 0.98 }}
      >
        Send krav
      </motion.button>
    </motion.div>
  );
}

function SceneSendRequest() {
  return (
    <motion.div {...sceneTransition} className="flex h-full flex-col items-center justify-center p-5 pt-16">
      <motion.div 
        className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/20"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <IconCheck className="h-12 w-12 text-primary" />
        </motion.div>
      </motion.div>
      
      <motion.p 
        className="mt-6 text-xl font-bold text-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Krav sendt!
      </motion.p>
      <motion.p 
        className="mt-2 text-center text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Venter på at mamma eller pappa godkjenner
      </motion.p>

      <motion.div 
        className="mt-8 w-full max-w-[200px] rounded-2xl bg-card p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Beløp</span>
          <span className="font-bold text-primary">7.00 kr</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

function SceneParentInbox() {
  return (
    <motion.div {...sceneTransition} className="h-full p-5 pt-16">
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">Foreldervisning</p>
        <h3 className="text-2xl font-bold text-foreground">Innboks</h3>
      </div>

      <motion.div 
        className="rounded-2xl bg-card p-5"
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/20 text-2xl">
            🐯
          </div>
          <div className="flex-1">
            <p className="text-lg font-bold text-foreground">Evelina</p>
            <p className="text-sm text-muted-foreground">2 oppgaver fullført</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-primary">7.00 kr</p>
            <p className="text-xs text-muted-foreground">Nettopp</p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between rounded-xl bg-background/50 px-4 py-3">
            <span className="text-sm text-foreground">Lage mat</span>
            <span className="text-sm font-medium text-primary">+2.00 kr</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-background/50 px-4 py-3">
            <span className="text-sm text-foreground">Oppvaskmaskin</span>
            <span className="text-sm font-medium text-primary">+5.00 kr</span>
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <motion.button 
            className="flex-1 rounded-xl bg-primary py-3.5 text-sm font-bold text-accent-foreground"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Godkjenn
          </motion.button>
          <button className="flex-1 rounded-xl bg-muted py-3.5 text-sm font-semibold text-muted-foreground">
            Avvis
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function SceneApproved() {
  return (
    <motion.div {...sceneTransition} className="flex h-full flex-col items-center justify-center p-5 pt-16">
      <motion.div 
        className="flex h-28 w-28 items-center justify-center rounded-full bg-primary"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <IconCheck className="h-14 w-14 text-accent-foreground" />
        </motion.div>
      </motion.div>
      
      <motion.p 
        className="mt-6 text-2xl font-bold text-foreground"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Godkjent!
      </motion.p>
      <motion.p 
        className="mt-2 text-center text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        7.00 kr er lagt til Evelinas saldo
      </motion.p>

      <motion.div
        className="mt-8 flex items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20 text-lg">
          🐯
        </div>
        <div className="rounded-2xl bg-card px-4 py-2">
          <p className="text-sm text-foreground">Ny saldo: <span className="font-bold text-primary">32.00 kr</span></p>
        </div>
      </motion.div>
    </motion.div>
  );
}

function SceneBalance() {
  return (
    <motion.div {...sceneTransition} className="h-full p-5 pt-16">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20 text-2xl">
          🐯
        </div>
        <div>
          <p className="font-bold text-foreground">Evelina</p>
          <p className="text-sm text-muted-foreground">Din oversikt</p>
        </div>
      </div>

      <motion.div 
        className="mt-6 rounded-3xl bg-gradient-to-br from-primary via-primary to-emerald-500 p-6"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-sm text-accent-foreground/80">Tilgjengelig saldo</p>
        <motion.p 
          className="mt-1 text-4xl font-bold text-accent-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          32.00 kr
        </motion.p>
      </motion.div>

      <div className="mt-6">
        <p className="mb-3 text-sm font-medium text-muted-foreground">Siste aktivitet</p>
        <div className="space-y-2">
          <motion.div 
            className="flex items-center justify-between rounded-xl bg-card px-4 py-3"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div>
              <p className="text-sm font-medium text-foreground">Oppgaver godkjent</p>
              <p className="text-xs text-muted-foreground">Nettopp</p>
            </div>
            <span className="font-bold text-primary">+7.00 kr</span>
          </motion.div>
          <motion.div 
            className="flex items-center justify-between rounded-xl bg-card px-4 py-3"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div>
              <p className="text-sm font-medium text-foreground">Ukepenger</p>
              <p className="text-xs text-muted-foreground">Forrige uke</p>
            </div>
            <span className="font-bold text-primary">+25.00 kr</span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function SceneWishlist() {
  return (
    <motion.div {...sceneTransition} className="h-full p-5 pt-16">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20 text-2xl">
          🐯
        </div>
        <div>
          <p className="font-bold text-foreground">Evelina</p>
          <p className="text-sm text-muted-foreground">Min ønskeliste</p>
        </div>
      </div>

      <div className="mt-6">
        <p className="mb-4 text-sm font-medium text-muted-foreground">Jeg sparer til:</p>
        
        <motion.div 
          className="rounded-2xl bg-card p-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-pink-500/20 text-2xl">
              🎀
            </div>
            <div className="flex-1">
              <p className="font-bold text-foreground">Nytt halskjede</p>
              <p className="text-sm text-muted-foreground">150 kr</p>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>32 av 150 kr</span>
              <span>21%</span>
            </div>
            <div className="mt-1.5 h-2.5 w-full rounded-full bg-muted">
              <motion.div 
                className="h-full rounded-full bg-gradient-to-r from-pink-500 to-rose-400"
                initial={{ width: 0 }}
                animate={{ width: "21%" }}
                transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
              />
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="mt-3 rounded-2xl bg-card p-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-purple-500/20 text-2xl">
              🎮
            </div>
            <div className="flex-1">
              <p className="font-bold text-foreground">Nintendo spill</p>
              <p className="text-sm text-muted-foreground">499 kr</p>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>32 av 499 kr</span>
              <span>6%</span>
            </div>
            <div className="mt-1.5 h-2.5 w-full rounded-full bg-muted">
              <motion.div 
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-violet-400"
                initial={{ width: 0 }}
                animate={{ width: "6%" }}
                transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
              />
            </div>
          </div>
        </motion.div>
      </div>

      <motion.button 
        className="mt-5 w-full rounded-2xl bg-card py-3 text-sm font-semibold text-primary"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        + Legg til nytt ønske
      </motion.button>
    </motion.div>
  );
}

// QR Code Setup Demo - iPad and iPhone side by side
function QRSetupDemo() {
  const [step, setStep] = useState(0);
  const reduceMotion = useReducedMotion();
  
  useEffect(() => {
    if (reduceMotion) return;
    
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % 4);
    }, 2500);
    
    return () => clearInterval(interval);
  }, [reduceMotion]);

  return (
    <div className="relative flex flex-col items-center gap-8 lg:flex-row lg:justify-center lg:gap-16">
      {/* Parent Phone */}
      <div className="relative">
        <div className="rounded-[36px] bg-gradient-to-b from-zinc-700 to-zinc-900 p-[8px] shadow-xl">
          <div className="rounded-[28px] bg-black p-[2px]">
            <div className="relative h-[320px] w-[150px] overflow-hidden rounded-[26px] bg-background sm:h-[380px] sm:w-[180px]">
              {/* Status bar */}
              <div className="flex h-8 items-center justify-between px-4 pt-1">
                <span className="text-[10px] font-semibold text-foreground">9:41</span>
                <div className="h-4 w-12 rounded-full bg-black" />
                <span className="text-[10px] text-foreground">100%</span>
              </div>
              
              <div className="p-4 pt-2">
                <p className="text-xs text-muted-foreground">Forelder</p>
                <p className="text-sm font-bold text-foreground">Legg til barn</p>
                
                <motion.div 
                  className="mt-4 flex aspect-square items-center justify-center rounded-2xl bg-white p-3"
                  animate={step >= 1 ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  {/* QR Code SVG */}
                  <svg viewBox="0 0 100 100" className="h-full w-full">
                    <rect fill="black" x="10" y="10" width="25" height="25" />
                    <rect fill="black" x="65" y="10" width="25" height="25" />
                    <rect fill="black" x="10" y="65" width="25" height="25" />
                    <rect fill="white" x="15" y="15" width="15" height="15" />
                    <rect fill="white" x="70" y="15" width="15" height="15" />
                    <rect fill="white" x="15" y="70" width="15" height="15" />
                    <rect fill="black" x="18" y="18" width="9" height="9" />
                    <rect fill="black" x="73" y="18" width="9" height="9" />
                    <rect fill="black" x="18" y="73" width="9" height="9" />
                    <rect fill="black" x="40" y="10" width="5" height="5" />
                    <rect fill="black" x="50" y="10" width="5" height="5" />
                    <rect fill="black" x="40" y="20" width="5" height="5" />
                    <rect fill="black" x="45" y="25" width="5" height="5" />
                    <rect fill="black" x="40" y="40" width="20" height="5" />
                    <rect fill="black" x="40" y="50" width="5" height="5" />
                    <rect fill="black" x="50" y="45" width="5" height="5" />
                    <rect fill="black" x="55" y="55" width="5" height="5" />
                    <rect fill="black" x="65" y="40" width="5" height="5" />
                    <rect fill="black" x="70" y="45" width="5" height="5" />
                    <rect fill="black" x="80" y="40" width="10" height="5" />
                    <rect fill="black" x="65" y="55" width="25" height="5" />
                    <rect fill="black" x="65" y="65" width="5" height="25" />
                    <rect fill="black" x="75" y="70" width="5" height="5" />
                    <rect fill="black" x="85" y="65" width="5" height="5" />
                    <rect fill="black" x="80" y="80" width="10" height="10" />
                    <rect fill="black" x="10" y="40" width="5" height="5" />
                    <rect fill="black" x="20" y="45" width="5" height="5" />
                    <rect fill="black" x="10" y="50" width="15" height="5" />
                    <rect fill="black" x="40" y="65" width="5" height="5" />
                    <rect fill="black" x="45" y="75" width="10" height="5" />
                    <rect fill="black" x="40" y="85" width="5" height="5" />
                  </svg>
                </motion.div>
                
                <p className="mt-3 text-center text-[10px] text-muted-foreground">
                  La barnet skanne denne koden
                </p>
              </div>
            </div>
          </div>
        </div>
        <p className="mt-4 text-center text-sm font-medium text-muted-foreground">Mamma/Pappa</p>
      </div>

      {/* Connection animation */}
      <motion.div 
        className="hidden lg:block"
        animate={step >= 1 && step < 3 ? { opacity: [0.3, 1, 0.3] } : { opacity: 0.3 }}
        transition={{ duration: 1.5, repeat: step >= 1 && step < 3 ? Infinity : 0 }}
      >
        <svg width="80" height="40" viewBox="0 0 80 40">
          <path 
            d="M0 20 Q40 0 80 20" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeDasharray="4 4"
            fill="none"
            className="text-primary"
          />
          <motion.circle
            cx="40"
            cy="10"
            r="4"
            fill="currentColor"
            className="text-primary"
            animate={step >= 1 && step < 3 ? { 
              cx: [0, 80],
              cy: [20, 20]
            } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </svg>
      </motion.div>

      {/* Child iPad */}
      <div className="relative">
        <div className="rounded-[28px] bg-gradient-to-b from-zinc-700 to-zinc-900 p-[8px] shadow-xl">
          <div className="rounded-[20px] bg-black p-[2px]">
            <div className="relative h-[280px] w-[200px] overflow-hidden rounded-[18px] bg-background sm:h-[320px] sm:w-[240px]">
              {/* Camera */}
              <div className="absolute top-3 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-zinc-700" />
              
              <AnimatePresence mode="wait">
                {step < 2 && (
                  <motion.div 
                    key="camera"
                    className="flex h-full flex-col items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="relative h-32 w-32 rounded-2xl border-4 border-dashed border-primary/50 sm:h-40 sm:w-40">
                      <motion.div
                        className="absolute inset-2 rounded-xl border-2 border-primary"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                      <motion.div
                        className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-primary/50"
                        animate={{ y: [-60, 60] }}
                        transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
                      />
                    </div>
                    <p className="mt-4 text-center text-xs text-muted-foreground">
                      Skann QR-koden
                    </p>
                  </motion.div>
                )}
                
                {step >= 2 && step < 3 && (
                  <motion.div 
                    key="scanning"
                    className="flex h-full flex-col items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.div 
                      className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.5 }}
                    >
                      <motion.div
                        className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                    </motion.div>
                    <p className="mt-4 text-center text-xs text-muted-foreground">
                      Kobler til...
                    </p>
                  </motion.div>
                )}
                
                {step >= 3 && (
                  <motion.div 
                    key="connected"
                    className="flex h-full flex-col items-center justify-center p-4"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <motion.div 
                      className="flex h-20 w-20 items-center justify-center rounded-full bg-primary"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    >
                      <IconCheck className="h-10 w-10 text-accent-foreground" />
                    </motion.div>
                    <motion.p 
                      className="mt-4 text-center text-sm font-bold text-foreground"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      Koblet til!
                    </motion.p>
                    <motion.div
                      className="mt-4 flex items-center gap-2 rounded-full bg-card px-4 py-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <span className="text-lg">🐯</span>
                      <span className="text-sm font-medium text-foreground">Evelina</span>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        <p className="mt-4 text-center text-sm font-medium text-muted-foreground">Barnets iPad</p>
      </div>
    </div>
  );
}

function FeatureCard(props: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-3xl bg-card p-6 sm:p-8">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        {props.icon}
      </div>
      <h3 className="mt-5 text-lg font-bold text-foreground">{props.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{props.description}</p>
    </div>
  );
}

export default function LandingClient() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />

      {/* Hero */}
      <section className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <motion.h1 
              className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="block text-balance">Ukepenger for</span>
              <span className="block text-balance text-primary">hele familien.</span>
            </motion.h1>
            <motion.p 
              className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Barn registrerer oppgaver. Foreldre godkjenner. Alt på ett sted.
            </motion.p>
            <motion.div 
              className="mt-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Link
                href="/login"
                className="inline-flex h-14 items-center justify-center rounded-2xl bg-primary px-8 text-base font-semibold text-accent-foreground transition-all duration-300 hover:bg-primary-dark hover:scale-105"
              >
                Kom i gang
                <IconArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* Phone Demo Section */}
      <section id="demo" className="scroll-mt-20 py-16 sm:py-24">
        <Container>
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Se hvordan det fungerer
            </h2>
            <p className="mt-3 text-muted-foreground">
              Fra oppgave til godkjenning på sekunder.
            </p>
          </div>

          <div className="mt-12 sm:mt-16">
            <PhoneDemo />
          </div>
        </Container>
      </section>

      {/* QR Setup Section */}
      <section className="border-t border-border py-16 sm:py-24">
        <Container>
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Enkel oppsett med QR-kode
            </h2>
            <p className="mt-3 text-muted-foreground">
              Barnet skanner koden - ferdig på sekunder.
            </p>
          </div>

          <div className="mt-12 sm:mt-16">
            <QRSetupDemo />
          </div>
        </Container>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-20 border-t border-border py-16 sm:py-24">
        <Container>
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Alt du trenger
            </h2>
          </div>

          <div className="mt-12 grid gap-4 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              }
              title="Oppgaveliste"
              description="Definer oppgaver med belønning. Barna velger og registrerer selv hva de har gjort."
            />
            <FeatureCard
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              title="Enkel godkjenning"
              description="Se alle krav i innboksen. Godkjenn med ett trykk når oppgavene er gjort."
            />
            <FeatureCard
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              title="Full oversikt"
              description="Hold styr på saldo, utbetalinger og sparemål for alle barna."
            />
            <FeatureCard
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              }
              title="Flere barn"
              description="Legg til så mange barn du vil. Hver med sin egen profil og saldo."
            />
            <FeatureCard
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              }
              title="Fungerer overalt"
              description="Mobil, nettbrett eller PC. Appen tilpasser seg enheten."
            />
            <FeatureCard
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
              title="Trygt og sikkert"
              description="All data er kryptert. Kun familien har tilgang."
            />
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="border-t border-border py-16 sm:py-24">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Klar til å komme i gang?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Gratis å bruke. Ingen kredittkort nødvendig.
            </p>
            <div className="mt-10">
              <Link
                href="/login"
                className="inline-flex h-14 items-center justify-center rounded-2xl bg-primary px-8 text-base font-semibold text-accent-foreground transition-all duration-300 hover:bg-primary-dark hover:scale-105"
              >
                Kom i gang
                <IconArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <Container>
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2 text-foreground">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                <span className="text-xs font-bold text-accent-foreground">U</span>
              </span>
              <span className="font-semibold">Ukepenger</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Laget for norske familier
            </p>
          </div>
        </Container>
      </footer>
    </div>
  );
}
