"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentFamilyContext } from "@/lib/family-client";
import { supabase } from "@/lib/supabaseClient";

type ChildRow = {
  id: string;
  name: string;
  active: boolean;
};

export default function KidsPage() {
  const [children, setChildren] = useState<ChildRow[]>([]);
  const [status, setStatus] = useState("Laster...");
  const [showKioskLink, setShowKioskLink] = useState(false);

  useEffect(() => {
    const run = async () => {
      const ctx = await getCurrentFamilyContext();
      if (!ctx.familyId) {
        setStatus("Denne enheten er ikke koblet til en familie.");
        setShowKioskLink(true);
        return;
      }

      const res = await supabase
        .from("children")
        .select("id, name, active")
        .eq("family_id", ctx.familyId)
        .eq("active", true)
        .order("name", { ascending: true });

      if (res.error) {
        setStatus(`Feil: ${res.error.message}`);
        return;
      }

      setChildren((res.data ?? []) as ChildRow[]);
      setStatus("");
      setShowKioskLink(false);
    };

    void run();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 md:px-8 md:py-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">Velg barn</h1>
        <p className="mb-6 text-sm text-slate-400">Trykk pa en profil for a vise oppgaver.</p>

        {status && (
          <div className="mb-6 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-300">
            <div>{status}</div>
            {showKioskLink && (
              <Link href="/kiosk" className="mt-2 inline-flex text-slate-100 underline underline-offset-4">
                Koble til kiosk
              </Link>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {children.map((child) => (
            <Link
              key={child.id}
              href={`/kids/${child.id}`}
              className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-0.5 hover:border-slate-600 hover:bg-slate-900/80"
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800 text-xl font-semibold text-slate-200">
                {child.name.slice(0, 1).toUpperCase()}
              </div>
              <div className="text-2xl font-semibold tracking-tight">{child.name}</div>
              <div className="mt-2 text-sm text-slate-400 group-hover:text-slate-300">Trykk for a fortsette</div>
            </Link>
          ))}
        </div>

        {children.length === 0 && !status && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
            Ingen aktive barn tilgjengelig.
          </div>
        )}
      </div>
    </main>
  );
}
