"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ensureFamilyForUser } from "@/lib/family-client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
    console.log("signup clicked");
    setStatus("");
    setIsLoading(true);
    const result = await supabase.auth.signUp({ email, password });
    console.log(result);

    if (result.error) {
      setIsLoading(false);
      setStatus(`Feil: ${result.error.message}`);
      return;
    }

    if (!result.data.user) {
      setIsLoading(false);
      setStatus("Konto opprettet, men fant ikke brukerdata.");
      return;
    }

    if (!result.data.session) {
      setIsLoading(false);
      setStatus("Konto opprettet. Bekreft e-post før du logger inn.");
      return;
    }

    const ensure = await ensureFamilyForUser({
      id: result.data.user.id,
      email: result.data.user.email,
    });
    setIsLoading(false);

    if (ensure.error) {
      setStatus(`Feil: ${ensure.error}`);
      return;
    }

    setStatus("Konto opprettet. Sender deg videre...");
    router.push("/admin/inbox");
  };

  const handleLogin = async () => {
    console.log("login clicked");
    setStatus("");
    setIsLoading(true);
    const result = await supabase.auth.signInWithPassword({ email, password });
    console.log(result);

    if (result.error) {
      setIsLoading(false);
      setStatus(`Feil: ${result.error.message}`);
      return;
    }

    if (!result.data.user) {
      setIsLoading(false);
      setStatus("Innlogging feilet: fant ikke bruker.");
      return;
    }

    const ensure = await ensureFamilyForUser({
      id: result.data.user.id,
      email: result.data.user.email,
    });
    setIsLoading(false);

    if (ensure.error) {
      setStatus(`Feil: ${ensure.error}`);
      return;
    }

    setStatus("Innlogging vellykket.");
    router.push("/admin/inbox");
  };

  const isError = status.startsWith("Feil:");
  const canSubmit = email.trim().length > 0 && password.length > 0 && !isLoading;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-slate-100">
      <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-black/20 md:p-7">
        <h1 className="mb-1 text-2xl font-semibold tracking-tight">Logg inn</h1>
        <p className="mb-6 text-sm text-slate-400">Bruk e-post og passord for a apne admin.</p>

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
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-slate-500"
              placeholder="Skriv passord"
            />
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={handleLogin}
            disabled={!canSubmit}
            className="w-full rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Logger inn..." : "Logg inn"}
          </button>

          <button
            type="button"
            onClick={handleSignUp}
            disabled={!canSubmit}
            className="w-full rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Vennligst vent..." : "Opprett konto"}
          </button>
        </div>

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
