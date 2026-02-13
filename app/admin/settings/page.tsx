"use client";

import { useCallback, useEffect, useState } from "react";
import { type ApprovalMode, getCurrentAdminContext } from "@/lib/family-client";
import { supabase } from "@/lib/supabaseClient";

export default function AdminSettingsPage() {
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [approvalMode, setApprovalMode] = useState<ApprovalMode>("REQUIRE_APPROVAL");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (nextFamilyId?: string) => {
    const id = nextFamilyId ?? familyId;
    if (!id) return;
    const res = await supabase.from("families").select("approval_mode").eq("id", id).maybeSingle();
    if (res.error || !res.data) {
      setStatus(`Feil: ${res.error?.message ?? "Familie ikke funnet."}`);
      return;
    }
    setApprovalMode((res.data.approval_mode as ApprovalMode) ?? "REQUIRE_APPROVAL");
  }, [familyId]);

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
  }, [load]);

  const toggleApprovalMode = async () => {
    if (!familyId) return;
    setStatus("");
    const nextMode: ApprovalMode = approvalMode === "REQUIRE_APPROVAL" ? "AUTO_APPROVE" : "REQUIRE_APPROVAL";
    const res = await supabase.from("families").update({ approval_mode: nextMode }).eq("id", familyId);
    if (res.error) {
      setStatus(`Feil: ${res.error.message}`);
      return;
    }
    setApprovalMode(nextMode);
    setStatus("Innstilling lagret.");
  };

  if (loading) return <div className="text-slate-300">Laster...</div>;

  const isError = status.startsWith("Feil:");

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <h3 className="mb-2 text-lg font-semibold tracking-tight">Godkjenning av krav</h3>
        <p className="mb-4 text-sm text-slate-300">
          Aktiv modus: <strong>{approvalMode === "REQUIRE_APPROVAL" ? "Krever godkjenning" : "Auto-godkjenn"}</strong>
        </p>
        <button
          type="button"
          onClick={() => void toggleApprovalMode()}
          className="rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-white"
        >
          Bytt modus
        </button>
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
    </section>
  );
}