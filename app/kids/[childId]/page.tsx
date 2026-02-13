"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getCurrentFamilyContext } from "@/lib/family-client";
import { supabase } from "@/lib/supabaseClient";

type ChildRow = {
  id: string;
  name: string;
};

type TaskRow = {
  id: string;
  title: string;
  amount_ore: number;
  active: boolean;
};

type ChildTaskSettingRow = {
  task_id: string;
  enabled: boolean;
};

function formatKr(ore: number) {
  return `${(ore / 100).toFixed(2)} kr`;
}

export default function KidTaskPage() {
  const params = useParams<{ childId: string }>();
  const childId = params.childId;

  const [child, setChild] = useState<ChildRow | null>(null);
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [enabledMap, setEnabledMap] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState("Laster...");
  const [showKioskLink, setShowKioskLink] = useState(false);
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});
  const [confirmations, setConfirmations] = useState<Record<string, number>>({});
  const [nowTs, setNowTs] = useState<number>(() => Date.now());

  useEffect(() => {
    const run = async () => {
      const ctx = await getCurrentFamilyContext();
      if (!ctx.familyId) {
        setStatus("Denne enheten er ikke koblet til en familie.");
        setShowKioskLink(true);
        return;
      }

      setShowKioskLink(false);

      const [childRes, taskRes, settingsRes] = await Promise.all([
        supabase.from("children").select("id, name").eq("id", childId).eq("family_id", ctx.familyId).maybeSingle(),
        supabase.from("tasks").select("id, title, amount_ore, active").eq("family_id", ctx.familyId).eq("active", true).order("title", { ascending: true }),
        supabase.from("child_task_settings").select("task_id, enabled").eq("child_id", childId),
      ]);

      if (childRes.error || !childRes.data) {
        setStatus(`Feil: ${childRes.error?.message ?? "Barn ikke funnet."}`);
        return;
      }
      if (taskRes.error) {
        setStatus(`Feil: ${taskRes.error.message}`);
        return;
      }
      if (settingsRes.error) {
        setStatus(`Feil: ${settingsRes.error.message}`);
        return;
      }

      const map: Record<string, boolean> = {};
      for (const row of (settingsRes.data ?? []) as ChildTaskSettingRow[]) {
        map[row.task_id] = row.enabled;
      }

      setChild(childRes.data as ChildRow);
      setTasks((taskRes.data ?? []) as TaskRow[]);
      setEnabledMap(map);
      setStatus("");
    };

    void run();
  }, [childId]);

  const visibleTasks = useMemo(
    () => tasks.filter((task) => enabledMap[task.id] !== false),
    [tasks, enabledMap]
  );

  useEffect(() => {
    const timer = setInterval(() => {
      const currentNow = Date.now();
      setNowTs(currentNow);
      setCooldowns((prev) => {
        const next: Record<string, number> = {};
        for (const [taskId, until] of Object.entries(prev)) {
          if (until > currentNow) next[taskId] = until;
        }
        return next;
      });
      setConfirmations((prev) => {
        const next: Record<string, number> = {};
        for (const [taskId, until] of Object.entries(prev)) {
          if (until > currentNow) next[taskId] = until;
        }
        return next;
      });
    }, 500);

    return () => clearInterval(timer);
  }, []);

  const submitClaim = async (taskId: string) => {
    setStatus("");
    const currentTs = Date.now();
    setCooldowns((prev) => ({ ...prev, [taskId]: currentTs + 10_000 }));

    const sessionRes = await supabase.auth.getSession();
    const accessToken = sessionRes.data.session?.access_token;

    const res = await fetch("/api/claims/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ childId, taskId }),
    });

    const payload = (await res.json()) as { error?: string; ok?: boolean; status?: string };
    if (!res.ok || payload.error) {
      setStatus(`Feil: ${payload.error ?? "Kunne ikke sende krav."}`);
      return;
    }

    setConfirmations((prev) => ({ ...prev, [taskId]: Date.now() + 2_500 }));

    if (payload.status === "APPROVED") {
      setStatus("Krav sendt og auto-godkjent.");
      return;
    }

    setStatus("Krav sendt.");
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 md:px-8 md:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold tracking-tight">{child ? child.name : "Barn"}</h1>
          <Link
            href="/kids"
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-900"
          >
            Bytt barn
          </Link>
        </div>

        {status && (
          <p
            className={`mb-6 rounded-lg border px-3 py-2 text-sm ${
              status.startsWith("Feil:")
                ? "border-red-800 bg-red-950/40 text-red-200"
                : "border-emerald-800 bg-emerald-950/40 text-emerald-200"
            }`}
          >
            <span>{status}</span>
            {showKioskLink && (
              <Link href="/kiosk" className="ml-2 inline-flex text-slate-100 underline underline-offset-4">
                Koble til kiosk
              </Link>
            )}
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visibleTasks.map((task) => {
            const disabled = (cooldowns[task.id] ?? 0) > nowTs;
            const secondsLeft = disabled ? Math.ceil(((cooldowns[task.id] ?? 0) - nowTs) / 1000) : 0;
            const justSubmitted = (confirmations[task.id] ?? 0) > nowTs;

            return (
              <button
                key={task.id}
                type="button"
                disabled={disabled}
                onClick={() => void submitClaim(task.id)}
                className="rounded-2xl border border-slate-700 bg-slate-900 p-6 text-left transition hover:border-slate-500 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 md:p-7"
              >
                <div className="text-2xl font-semibold tracking-tight">{task.title}</div>
                <div className="mt-2 text-3xl font-bold text-emerald-300">{formatKr(task.amount_ore)}</div>
                <div className="mt-4 text-sm font-medium text-slate-300">
                  {justSubmitted ? "Sendt!" : disabled ? `Vent ${secondsLeft}s` : "Trykk for a sende krav"}
                </div>
                {disabled && (
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full bg-emerald-400 transition-all"
                      style={{ width: `${Math.max(0, Math.min(100, (secondsLeft / 10) * 100))}%` }}
                    />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {visibleTasks.length === 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
            Ingen synlige oppgaver for dette barnet.
          </div>
        )}
      </div>
    </main>
  );
}
