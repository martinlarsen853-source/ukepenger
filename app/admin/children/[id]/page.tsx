"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { getCurrentAdminContext } from "@/lib/family-client";
import { supabase } from "@/lib/supabaseClient";

type TaskRow = {
  id: string;
  title: string;
  active: boolean;
};

type ChildRow = {
  id: string;
  name: string;
};

type ChildTaskSettingRow = {
  task_id: string;
  enabled: boolean;
};

export default function AdminChildTaskSettingsPage() {
  const params = useParams<{ id: string }>();
  const childId = params.id;

  const [familyId, setFamilyId] = useState<string | null>(null);
  const [child, setChild] = useState<ChildRow | null>(null);
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [enabledMap, setEnabledMap] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState("");
  const [wishlistTitle, setWishlistTitle] = useState("");
  const [wishlistTargetKr, setWishlistTargetKr] = useState("");
  const [wishlistNote, setWishlistNote] = useState("");
  const [wishlistStatus, setWishlistStatus] = useState("");
  const [wishlistSaving, setWishlistSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (nextFamilyId?: string) => {
    const id = nextFamilyId ?? familyId;
    if (!id) return;

    const [childRes, taskRes, settingsRes] = await Promise.all([
      supabase.from("children").select("id, name").eq("family_id", id).eq("id", childId).maybeSingle(),
      supabase.from("tasks").select("id, title, active").eq("family_id", id).order("created_at", { ascending: false }),
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
  }, [childId, familyId]);

  useEffect(() => {
    const run = async () => {
      const ctx = await getCurrentAdminContext();
      if (!ctx.familyId) {
        setStatus("Fant ikke familie.");
        setLoading(false);
        return;
      }
      setFamilyId(ctx.familyId);
      await load(ctx.familyId);
      setLoading(false);
    };

    void run();
  }, [childId, load]);

  const isEnabled = (taskId: string) => enabledMap[taskId] !== false;

  const toggle = async (taskId: string) => {
    setStatus("");
    const nextEnabled = !isEnabled(taskId);
    const res = await supabase.from("child_task_settings").upsert({
      child_id: childId,
      task_id: taskId,
      enabled: nextEnabled,
    });

    if (res.error) {
      setStatus(`Feil: ${res.error.message}`);
      return;
    }

    setEnabledMap((prev) => ({ ...prev, [taskId]: nextEnabled }));
  };

  const createWishlistItem = async () => {
    setWishlistStatus("");
    const title = wishlistTitle.trim();
    const targetKr = Number(wishlistTargetKr);
    const targetOre = Number.isFinite(targetKr) ? Math.round(targetKr * 100) : 0;

    if (!title) {
      setWishlistStatus("Feil: Skriv tittel.");
      return;
    }
    if (!Number.isInteger(targetOre) || targetOre <= 0) {
      setWishlistStatus("Feil: Skriv gyldig belop i kr.");
      return;
    }

    const sessionRes = await supabase.auth.getSession();
    const accessToken = sessionRes.data.session?.access_token;
    if (!accessToken) {
      setWishlistStatus("Feil: Mangler innloggingstoken. Logg inn pa nytt.");
      return;
    }

    setWishlistSaving(true);
    const response = await fetch("/api/admin/wishlist/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        childId,
        title,
        targetOre,
        note: wishlistNote.trim() || undefined,
      }),
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    setWishlistSaving(false);

    if (!response.ok || payload.error) {
      setWishlistStatus(`Feil: ${payload.error ?? "Kunne ikke lagre onskeliste-item."}`);
      return;
    }

    setWishlistTitle("");
    setWishlistTargetKr("");
    setWishlistNote("");
    setWishlistStatus("Onskeliste-item lagt til.");
  };

  if (loading) return <div className="text-slate-300">Laster...</div>;
  if (!child) return <div className="text-slate-300">Barn ikke funnet.</div>;

  const isError = status.startsWith("Feil:");

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold tracking-tight">Oppgave-tilganger: {child.name}</h2>
        <Link
          href="/admin/children"
          className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-900"
        >
          Tilbake
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

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 md:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-semibold tracking-tight">Onskeliste</h3>
          <span className="text-xs text-slate-500">MVP: legg til nye onsker</span>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <label className="space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Tittel</span>
            <input
              value={wishlistTitle}
              onChange={(e) => setWishlistTitle(e.target.value)}
              placeholder="For eksempel: Ny sykkel"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-slate-500"
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Belop (kr)</span>
            <input
              value={wishlistTargetKr}
              onChange={(e) => setWishlistTargetKr(e.target.value)}
              type="number"
              min="1"
              step="0.01"
              placeholder="299.00"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-slate-500"
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Notat (valgfritt)</span>
            <input
              value={wishlistNote}
              onChange={(e) => setWishlistNote(e.target.value)}
              placeholder="Farge, modell, osv."
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-slate-500"
            />
          </label>
        </div>
        <button
          type="button"
          onClick={() => void createWishlistItem()}
          disabled={wishlistSaving}
          className="mt-3 rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {wishlistSaving ? "Lagrer..." : "Legg til"}
        </button>
        {wishlistStatus && (
          <p
            className={`mt-3 rounded-lg border px-3 py-2 text-sm ${
              wishlistStatus.startsWith("Feil:")
                ? "border-red-800 bg-red-950/40 text-red-200"
                : "border-emerald-800 bg-emerald-950/40 text-emerald-200"
            }`}
          >
            {wishlistStatus}
          </p>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-800/70 text-slate-300">
            <tr>
              <th className="px-4 py-3">Oppgave</th>
              <th className="px-4 py-3">Aktiv oppgave</th>
              <th className="px-4 py-3">Synlig for barn</th>
              <th className="px-4 py-3">Handling</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} className="border-t border-slate-800 text-slate-100">
                <td className="px-4 py-3">{task.title}</td>
                <td className="px-4 py-3">{task.active ? "Ja" : "Nei"}</td>
                <td className="px-4 py-3">{isEnabled(task.id) ? "Ja" : "Nei"}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => void toggle(task.id)}
                    className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
                  >
                    {isEnabled(task.id) ? "Skjul" : "Vis"}
                  </button>
                </td>
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr>
                <td className="px-4 py-10 text-center text-slate-400" colSpan={4}>
                  Ingen oppgaver funnet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
