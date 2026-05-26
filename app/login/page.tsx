"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ensureFamilyForUser, getAdminSetupStatus } from "@/lib/family-client";
import { supabase } from "@/lib/supabaseClient";

type AuthAction = "login" | "signup" | "google" | "apple" | "resend" | null;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [action, setAction] = useState<AuthAction>(null);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  const isLoading = action !== null;

  const goAfterAuth = async () => {
    const setup = await getAdminSetupStatus();
    if (setup.needsOnboarding) {
      router.push("/onboarding");
      return;
    }
    router.push("/admin/inbox");
  };

  const handleSignUp = async () => {
    setStatus("");
    setAction("signup");
    const result = await supabase.auth.signUp({ email, password });

    if (result.error) {
      setAction(null);
      setStatus(`Feil: ${result.error.message}`);
      return;
    }

    if (!result.data.user) {
      setAction(null);
      setStatus("Konto opprettet, men fant ikke brukerdata.");
      return;
    }

    if (!result.data.session) {
      setAction(null);
      setAwaitingConfirmation(true);
      setStatus("");
      return;
    }

    const ensure = await ensureFamilyForUser({
      id: result.data.user.id,
      email: result.data.user.email,
    });

    if (ensure.error) {
      setAction(null);
      setStatus(`Feil: ${ensure.error}`);
      return;
    }

    await goAfterAuth();
    setAction(null);
  };

  const handleResend = async () => {
    if (!email.trim()) return;
    setAction("resend");
    const { error } = await supabase.auth.resend({ type: "signup", email });
    setAction(null);
    if (error) {
      setStatus(`Feil: ${error.message}`);
    } else {
      setStatus("Ny e-post sendt! Sjekk innboksen (og søppelpost).");
    }
  };

  const handleLogin = async () => {
    setStatus("");
    setAction("login");
    const result = await supabase.auth.signInWithPassword({ email, password });

    if (result.error) {
      setAction(null);
      setStatus(`Feil: ${result.error.message}`);
      return;
    }

    if (!result.data.user) {
      setAction(null);
      setStatus("Innlogging feilet: fant ikke bruker.");
      return;
    }

    const ensure = await ensureFamilyForUser({
      id: result.data.user.id,
      email: result.data.user.email,
    });

    if (ensure.error) {
      setAction(null);
      setStatus(`Feil: ${ensure.error}`);
      return;
    }

    await goAfterAuth();
    setAction(null);
  };

  const handleOAuth = async (provider: "google" | "apple") => {
    setStatus("");
    setAction(provider);
    const redirectTo = `${window.location.origin}/auth/callback`;

    const result = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });

    if (result.error) {
      setAction(null);
      setStatus(`Feil: ${result.error.message}`);
      return;
    }
  };

  const isError = status.startsWith("Feil:");
  const canSubmit = email.trim().length > 0 && password.length > 0 && !isLoading;

  if (awaitingConfirmation) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-slate-100">
        <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-black/20 md:p-7">
          <div className="mb-4 text-3xl">📬</div>
          <h1 className="mb-2 text-2xl font-semibold tracking-tight">Sjekk e-posten din</h1>
          <p className="text-sm text-slate-300">
            Vi har sendt en bekreftelseslenke til{" "}
            <span className="font-medium text-slate-100">{email}</span>.
            Klikk lenken for å aktivere kontoen din.
          </p>
          <div className="mt-4 rounded-lg border border-amber-800 bg-amber-950/30 px-3 py-2.5 text-sm text-amber-200">
            Finner du ikke e-posten? Sjekk <strong>søppelpost / spam</strong> – den kan havne der.
          </div>
          <div className="mt-5 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => void handleResend()}
              disabled={action === "resend"}
              className="w-full rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {action === "resend" ? "Sender..." : "Send e-post på nytt"}
            </button>
            <button
              type="button"
              onClick={() => { setAwaitingConfirmation(false); setStatus(""); }}
              className="w-full rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-800"
            >
              Tilbake til innlogging
            </button>
          </div>
          {status && (
            <p className={`mt-4 rounded-lg border px-3 py-2 text-sm ${
              status.startsWith("Feil:")
                ? "border-red-800 bg-red-950/40 text-red-200"
                : "border-emerald-800 bg-emerald-950/40 text-emerald-200"
            }`}>
              {status}
            </p>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-slate-100">
      <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-black/20 md:p-7">
        <h1 className="mb-1 text-2xl font-semibold tracking-tight">Logg inn</h1>
        <p className="mb-6 text-sm text-slate-400">E-post/passord eller OAuth for å åpne admin.</p>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => void handleOAuth("google")}
            disabled={isLoading}
            className="w-full rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {action === "google" ? "Sender til Google..." : "Fortsett med Google"}
          </button>
          <button
            type="button"
            onClick={() => void handleOAuth("apple")}
            disabled={isLoading}
            className="w-full rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {action === "apple" ? "Sender til Apple..." : "Fortsett med Apple"}
          </button>
        </div>

        <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wide text-slate-500">
          <div className="h-px flex-1 bg-slate-800" />
          <span>Eller</span>
          <div className="h-px flex-1 bg-slate-800" />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (canSubmit) void handleLogin();
          }}
          noValidate
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-300">
                E-post
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                inputMode="email"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-slate-500"
                placeholder="navn@epost.no"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-300">
                Passord
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                enterKeyHint="go"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-slate-500"
                placeholder="Skriv passord"
              />
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {action === "login" ? "Logger inn..." : "Logg inn"}
            </button>

            <button
              type="button"
              onClick={() => void handleSignUp()}
              disabled={!canSubmit}
              className="w-full rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {action === "signup" ? "Oppretter konto..." : "Opprett konto"}
            </button>
          </div>
        </form>

        <div className="mt-4 min-h-5">
          {status && (
            <p
              className={`rounded-lg border px-3 py-2 text-sm ${
                isError
                  ? "border-red-800 bg-red-950/40 text-red-200"
                  : "border-emerald-800 bg-emerald-950/40 text-emerald-200"
              }`}
            >
              {status}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
