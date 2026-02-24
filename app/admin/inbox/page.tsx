"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getCurrentAdminContext } from "@/lib/family-client";
import { supabase } from "@/lib/supabaseClient";

type ClaimRow = {
  id: string;
  created_at: string;
  amount_ore: number;
  child_id: string;
  task_id: string;
  children: { name: string }[] | null;
  tasks: { title: string }[] | null;
};

type ChildRow = {
  id: string;
  name: string;
};

type TaskRow = {
  id: string;
  title: string;
};

function formatKr(ore: number) {
  return `${(ore / 100).toFixed(2)} kr`;
}

export default function AdminInboxPage() {
  const [items, setItems] = useState<ClaimRow[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [childMap, setChildMap] = useState<Record<string, string>>({});
  const [taskMap, setTaskMap] = useState<Record<string, string>>({});

  const load = useCallback(async (nextFamilyId?: string) => {
    const family = nextFamilyId ?? familyId;
    if (!family) return;

    const [claimsRes, childrenRes, tasksRes] = await Promise.all([
      supabase
        .from("claims")
        .select("id, created_at, amount_ore, child_id, task_id, children(name), tasks(title)")
        .eq("family_id", family)
        .eq("status", "SENT")
        .order("created_at", { ascending: false }),
      supabase
        .from("children")
        .select("id, name")
        .eq("family_id", family)
        .eq("active", true)
        .order("name", { ascending: true }),
      supabase
        .from("tasks")
        .select("id, title")
        .eq("family_id", family)
        .eq("active", true)
        .order("title", { ascending: true }),
    ]);

    if (claimsRes.error || childrenRes.error || tasksRes.error) {
      setStatus(`Feil: ${claimsRes.error?.message ?? childrenRes.error?.message ?? tasksRes.error?.message}`);
      return;
    }

    const nextChildMap: Record<string, string> = {};
    for (const child of (childrenRes.data ?? []) as ChildRow[]) nextChildMap[child.id] = child.name;
    setChildMap(nextChildMap);

    const nextTaskMap: Record<string, string> = {};
    for (const task of (tasksRes.data ?? []) as TaskRow[]) nextTaskMap[task.id] = task.title;
    setTaskMap(nextTaskMap);

    setItems((claimsRes.data ?? []) as ClaimRow[]);
  }, [familyId]);

  useEffect(() => {
    const run = async () => {
      const ctx = await getCurrentAdminContext();
      if (!ctx.user || !ctx.familyId) {
        setLoading(false);
        setStatus("Logg inn for a se krav.");
        return;
      }
      setFamilyId(ctx.familyId);
      setUserId(ctx.user.id);
      await load(ctx.familyId);
      setLoading(false);
    };

    void run();
  }, [load]);

  const decide = async (claimId: string, statusValue: "APPROVED" | "REJECTED") => {
    if (!userId) return;
    setStatus("");
    const res = await supabase
      .from("claims")
      .update({
        status: statusValue,
        decided_at: new Date().toISOString(),
        decided_by: userId,
      })
      .eq("id", claimId);

    if (res.error) {
      setStatus(`Feil: ${res.error.message}`);
      return;
    }

    setStatus(statusValue === "APPROVED" ? "Krav godkjent." : "Krav avvist.");
    await load();
  };

  if (loading) return <div className="text-slate-300">Laster...</div>;
  const isError = status.startsWith("Feil:");

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold tracking-tight">Ventende krav</h2>
        <Link
          href="/admin/payments"
          className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-900"
        >
          Ga til utbetalinger
        </Link>
      </div>

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

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-800/70 text-slate-300">
            <tr>
              <th className="px-4 py-3">Barn</th>
              <th className="px-4 py-3">Oppgave</th>
              <th className="px-4 py-3">Belop</th>
              <th className="px-4 py-3">Tid</th>
              <th className="px-4 py-3">Handling</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-slate-800 text-slate-100">
                <td className="px-4 py-3">{childMap[item.child_id] ?? item.children?.[0]?.name ?? item.child_id}</td>
                <td className="px-4 py-3">{taskMap[item.task_id] ?? item.tasks?.[0]?.title ?? item.task_id}</td>
                <td className="px-4 py-3">{formatKr(item.amount_ore)}</td>
                <td className="px-4 py-3">{new Date(item.created_at).toLocaleString("nb-NO")}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => void decide(item.id, "APPROVED")}
                      className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-900 transition hover:bg-white"
                    >
                      Godkjenn
                    </button>
                    <button
                      type="button"
                      onClick={() => void decide(item.id, "REJECTED")}
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-red-500"
                    >
                      Avvis
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td className="px-4 py-10 text-center text-slate-400" colSpan={5}>
                  Ingen ventende krav akkurat na.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
