"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { ensureFamilyForUser, getAdminSetupStatus } from "@/lib/family-client";
import { supabase } from "@/lib/supabaseClient";

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Fullfører innlogging...");

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      const code = searchParams.get("code");
      const errorParam = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");

      if (errorParam) {
        if (mounted) {
          const msg = errorDescription ?? errorParam;
          if (msg.toLowerCase().includes("expired")) {
            setStatus("Lenken har utløpt. Gå tilbake til innlogging og be om en ny.");
          } else {
            setStatus(`Feil: ${msg}`);
          }
        }
        return;
      }

      // PKCE flow: exchange the code for a session
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          if (mounted) setStatus(`Feil: ${error.message}`);
          return;
        }
      }

      // Poll briefly for the session (covers implicit flow and small delays)
      for (let i = 0; i < 8; i += 1) {
        const sessionRes = await supabase.auth.getSession();
        const session = sessionRes.data.session;

        if (session?.user) {
          const ensure = await ensureFamilyForUser({
            id: session.user.id,
            email: session.user.email,
          });

          if (ensure.error) {
            if (mounted) setStatus(`Feil: ${ensure.error}`);
            return;
          }

          const setup = await getAdminSetupStatus();
          if (!mounted) return;

          router.replace(setup.needsOnboarding ? "/onboarding" : "/admin/inbox");
          return;
        }

        await wait(300);
      }

      if (mounted) {
        setStatus("Fant ikke aktiv sesjon. Lenken kan være utløpt – prøv å logge inn på nytt.");
      }
    };

    void run();

    return () => {
      mounted = false;
    };
  }, [router, searchParams]);

  const isError = status.startsWith("Feil:") || status.includes("utløpt") || status.includes("Fant ikke");

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center">
        {!isError && (
          <div className="mb-4 flex justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-600 border-t-slate-200" />
          </div>
        )}
        <h1 className="text-xl font-semibold tracking-tight">
          {isError ? "Noe gikk galt" : "Logger inn..."}
        </h1>
        <p className="mt-3 text-sm text-slate-300">{status}</p>
        {isError && (
          <a
            href="/login"
            className="mt-5 inline-block rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-white"
          >
            Tilbake til innlogging
          </a>
        )}
      </div>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center">
            <div className="mb-4 flex justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-600 border-t-slate-200" />
            </div>
            <p className="text-sm text-slate-300">Fullfører innlogging...</p>
          </div>
        </main>
      }
    >
      <AuthCallbackInner />
    </Suspense>
  );
}
