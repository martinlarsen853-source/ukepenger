"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ensureFamilyForUser, getAdminSetupStatus } from "@/lib/family-client";
import { supabase } from "@/lib/supabaseClient";

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Fullforer innlogging...");

  useEffect(() => {
    let mounted = true;

    const run = async () => {
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
        setStatus("Feil: Fant ikke aktiv sesjon etter OAuth. Prov igjen fra login.");
      }
    };

    void run();

    return () => {
      mounted = false;
    };
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center">
        <h1 className="text-xl font-semibold tracking-tight">OAuth callback</h1>
        <p className="mt-3 text-sm text-slate-300">{status}</p>
      </div>
    </main>
  );
}
