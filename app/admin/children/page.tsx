"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getCurrentAdminContext } from "@/lib/family-client";
import { supabase } from "@/lib/supabaseClient";

type ChildRow = {
  id: string;
  name: string;
  active: boolean;
};

type ClaimRow = {
  child_id: string;
  status: string;
  amount_ore: number;
};

type ChildStats = {
  dueOre: number;
  paidOre: number;
  totalCount: number;
};

function formatKr(ore: number) {
  return `${(ore / 100).toFixed(2)} kr`;
}

export default function AdminChildrenPage() {
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [children, setChildren] = useState<ChildRow[]>([]);
  const [statsByChild, setStatsByChild] = useState<Record<string, ChildStats>>({});
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (nextFamilyId?: string) => {
    const id = nextFamilyId ?? familyId;
    if (!id) return;

    const childrenRes = await supabase
      .from("children")
      .select("id, name, active")
      .eq("family_id", id)
      .order("created_at", { ascending: false });

    if (childrenRes.error) {
      setStatus(`Feil: ${childrenRes.error.message}`);
      return;
    }

    setChildren((childrenRes.data ?? []) as ChildRow[]);

    const claimsRes = await supabase
      .from("claims")
      .select("child_id, status, amount_ore")
      .eq("family_id", id);

    if (claimsRes.error) {
      setStatus(`Feil: ${claimsRes.error.message}`);
      return;
    }

    const nextStats: Record<string, ChildStats> = {};
    for (const claim of (claimsRes.data ?? []) as ClaimRow[]) {
      if (!nextStats[claim.child_id]) {
        nextStats[claim.child_id] = { dueOre: 0, paidOre: 0, totalCount: 0 };
      }
      nextStats[claim.child_id].totalCount += 1;
      if (claim.status === "APPROVED") {
        nextStats[claim.child_id].dueOre += claim.amount_ore;
      }
      if (claim.status === "PAID") {
        nextStats[claim.child_id].paidOre += claim.amount_ore;
      }
    }

    setStatsByChild(nextStats);
  }, [familyId]);

  useEffect(() => {
    const run = async () => {
      const ctx = await getCurrentAdminContext();
      if (!ctx.familyId) {
        setLoading(false);
        setStatus("Fant ikke familie.");
        return;
      }

      setFamilyId(ctx.familyId);
      await load(ctx.familyId);
      setLoading(false);
    };

    void run();
  }, [load]);

  const createChild = async () => {
    if (!familyId) return;
    setStatus("");
    if (!name.trim()) {
      setStatus("Skriv navn.");
      return;
    }

    const res = await supabase.from("children").insert({
      family_id: familyId,
      name: name.trim(),
      active: true,
    });

    if (res.error) {
      setStatus(`Feil: ${res.error.message}`);
      return;
    }

    setName("");
    setStatus("Barn opprettet.");
    await load();
  };

  const toggleActive = async (child: ChildRow) => {
    setStatus("");
    const res = await supabase.from("children").update({ active: !child.active }).eq("id", child.id);
    if (res.error) {
      setStatus(`Feil: ${res.error.message}`);
      return;
    }
    await load();
  };

  if (loading) return <div className="text-slate-300">Laster...</div>;

  const isError = status.startsWith("Feil:");
  const disableCreate = name.trim().length === 0;

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 md:p-5">
        <h3 className="mb-3 text-base font-semibold tracking-tight">Legg til barn</h3>
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="flex-1 space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Navn</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="For eksempel: Nora"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-slate-500"
            />
          </label>
          <button
            type="button"
            onClick={() => void createChild()}
            disabled={disableCreate}
            className="self-end rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Opprett
          </button>
        </div>
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

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 md:p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold tracking-tight">Oversikt per barn</h3>
          <span className="text-xs uppercase tracking-wide text-slate-500">Til gode / Utbetalt / Krav</span>
        </div>
        {children.length === 0 ? (
          <div className="text-sm text-slate-400">Ingen barn a vise.</div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {children.map((child) => {
              const stats = statsByChild[child.id] ?? { dueOre: 0, paidOre: 0, totalCount: 0 };
              return (
                <div key={child.id} className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-100">{child.name}</div>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        child.active ? "bg-emerald-950/60 text-emerald-300" : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {child.active ? "Aktiv" : "Inaktiv"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-slate-400">
                    <div>
                      <div className="text-slate-500">Til gode</div>
                      <div className="mt-1 text-sm font-semibold text-emerald-300">{formatKr(stats.dueOre)}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Utbetalt</div>
                      <div className="mt-1 text-sm font-semibold text-slate-200">{formatKr(stats.paidOre)}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Krav</div>
                      <div className="mt-1 text-sm font-semibold text-slate-200">{stats.totalCount}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-800/70 text-slate-300">
            <tr>
              <th className="px-4 py-3">Navn</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Handling</th>
            </tr>
          </thead>
          <tbody>
            {children.map((child) => (
              <tr key={child.id} className="border-t border-slate-800 text-slate-100">
                <td className="px-4 py-3">{child.name}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                      child.active ? "bg-emerald-950/60 text-emerald-300" : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {child.active ? "Aktiv" : "Inaktiv"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void toggleActive(child)}
                      className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
                    >
                      {child.active ? "Deaktiver" : "Aktiver"}
                    </button>
                    <Link
                      href={`/admin/children/${child.id}`}
                      className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
                    >
                      Oppgave-tilganger
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {children.length === 0 && (
              <tr>
                <td className="px-4 py-10 text-center text-slate-400" colSpan={3}>
                  Ingen barn enda. Legg til forste barn over.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}