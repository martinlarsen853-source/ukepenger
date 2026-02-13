"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { getCurrentAdminContext } from "@/lib/family-client";
import { supabase } from "@/lib/supabaseClient";

type ChildRow = {
  id: string;
  name: string;
};

type ClaimRow = {
  id: string;
  amount_ore: number;
  created_at: string;
  task_id: string;
  tasks: { title: string }[] | null;
};

type PaymentRow = {
  id: string;
  created_at: string;
  method: string;
  amount_ore: number;
  child_id: string;
  children: { name: string }[] | null;
};

type PaymentClaimRow = {
  payment_id: string;
  claims: { id: string; amount_ore: number; task_id: string; tasks: { title: string }[] | null } | null;
};

type PaymentMethod = "VIPPS" | "CASH" | "BANK" | "OTHER";

function formatKr(ore: number) {
  return `${(ore / 100).toFixed(2)} kr`;
}

export default function AdminPaymentsPage() {
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [children, setChildren] = useState<ChildRow[]>([]);
  const [selectedChildId, setSelectedChildId] = useState("");
  const [claims, setClaims] = useState<ClaimRow[]>([]);
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [paymentClaims, setPaymentClaims] = useState<Record<string, ClaimRow[]>>({});
  const [expandedPayments, setExpandedPayments] = useState<Record<string, boolean>>({});
  const [method, setMethod] = useState<PaymentMethod>("VIPPS");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadChildren = useCallback(async (nextFamilyId?: string) => {
    const id = nextFamilyId ?? familyId;
    if (!id) return;

    const res = await supabase
      .from("children")
      .select("id, name")
      .eq("family_id", id)
      .eq("active", true)
      .order("name", { ascending: true });

    if (res.error) {
      setStatus(`Feil: ${res.error.message}`);
      return;
    }

    const rows = (res.data ?? []) as ChildRow[];
    setChildren(rows);
    if (!selectedChildId && rows.length > 0) {
      setSelectedChildId(rows[0].id);
    }
  }, [familyId, selectedChildId]);

  const loadPayments = useCallback(async (nextFamilyId?: string) => {
    const id = nextFamilyId ?? familyId;
    if (!id) return;

    const paymentRes = await supabase
      .from("payments")
      .select("id, created_at, method, amount_ore, child_id, children(name)")
      .eq("family_id", id)
      .order("created_at", { ascending: false });

    if (paymentRes.error) {
      setStatus(`Feil: ${paymentRes.error.message}`);
      return;
    }

    const paymentRows = (paymentRes.data ?? []) as PaymentRow[];
    setPayments(paymentRows);

    if (paymentRows.length === 0) {
      setPaymentClaims({});
      return;
    }

    const paymentIds = paymentRows.map((payment) => payment.id);
    const claimRes = await supabase
      .from("payment_claims")
      .select("payment_id, claims(id, amount_ore, task_id, tasks(title))")
      .in("payment_id", paymentIds);

    if (claimRes.error) {
      setStatus(`Feil: ${claimRes.error.message}`);
      return;
    }

    const nextMap: Record<string, ClaimRow[]> = {};
    for (const row of (claimRes.data ?? []) as PaymentClaimRow[]) {
      if (!row.claims) continue;
      if (!nextMap[row.payment_id]) nextMap[row.payment_id] = [];
      nextMap[row.payment_id].push({
        id: row.claims.id,
        amount_ore: row.claims.amount_ore,
        created_at: "",
        task_id: row.claims.task_id,
        tasks: row.claims.tasks,
      });
    }
    setPaymentClaims(nextMap);
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
      await Promise.all([loadChildren(ctx.familyId), loadPayments(ctx.familyId)]);
      setLoading(false);
    };

    void run();
  }, [loadChildren, loadPayments]);

  useEffect(() => {
    const run = async () => {
      if (!familyId || !selectedChildId) {
        setClaims([]);
        return;
      }
      const res = await supabase
        .from("claims")
        .select("id, amount_ore, created_at, task_id, tasks(title)")
        .eq("family_id", familyId)
        .eq("child_id", selectedChildId)
        .eq("status", "APPROVED")
        .order("created_at", { ascending: false });

      if (res.error) {
        setStatus(`Feil: ${res.error.message}`);
        return;
      }

      setClaims((res.data ?? []) as ClaimRow[]);
      setSelectedIds({});
    };

    void run();
  }, [familyId, selectedChildId]);

  const selectedClaimIds = useMemo(
    () => claims.filter((claim) => selectedIds[claim.id]).map((claim) => claim.id),
    [claims, selectedIds]
  );

  const totalOre = useMemo(
    () =>
      claims
        .filter((claim) => selectedIds[claim.id])
        .reduce((sum, claim) => sum + claim.amount_ore, 0),
    [claims, selectedIds]
  );

  const toggleClaim = (id: string) => {
    setSelectedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleExpanded = (paymentId: string) => {
    setExpandedPayments((prev) => ({ ...prev, [paymentId]: !prev[paymentId] }));
  };

  const submitPayment = async () => {
    if (!selectedChildId) {
      setStatus("Velg et barn.");
      return;
    }
    if (!selectedClaimIds.length) {
      setStatus("Velg minst ett krav.");
      return;
    }

    setSubmitting(true);
    setStatus("");

    const sessionRes = await supabase.auth.getSession();
    const accessToken = sessionRes.data.session?.access_token;
    if (!accessToken) {
      setSubmitting(false);
      setStatus("Mangler innloggingstoken. Logg inn pa nytt.");
      return;
    }

    const response = await fetch("/api/payments/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        childId: selectedChildId,
        claimIds: selectedClaimIds,
        method,
        note: note.trim() || undefined,
      }),
    });

    const payload = (await response.json()) as {
      error?: string;
      paymentId?: string;
      amount_ore?: number;
    };

    setSubmitting(false);

    if (!response.ok || payload.error) {
      setStatus(`Feil: ${payload.error ?? "Kunne ikke registrere utbetaling."}`);
      return;
    }

    setStatus(
      `Utbetaling registrert. ID: ${payload.paymentId}. Sum: ${formatKr(payload.amount_ore ?? 0)}.`
    );
    setNote("");

    if (!familyId || !selectedChildId) return;
    const res = await supabase
      .from("claims")
      .select("id, amount_ore, created_at, task_id, tasks(title)")
      .eq("family_id", familyId)
      .eq("child_id", selectedChildId)
      .eq("status", "APPROVED")
      .order("created_at", { ascending: false });
    if (res.error) {
      setStatus(`Feil: ${res.error.message}`);
      return;
    }
    setClaims((res.data ?? []) as ClaimRow[]);
    setSelectedIds({});
    await loadPayments();
  };

  if (loading) return <div className="text-slate-300">Laster...</div>;

  const isError = status.startsWith("Feil:");

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 md:p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold tracking-tight">Utbetalinger</h3>
          <span className="text-xs uppercase tracking-wide text-slate-500">Historikk</span>
        </div>
        {payments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950 p-6 text-center text-sm text-slate-400">
            Ingen utbetalinger registrert enda.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800/70 text-slate-300">
                <tr>
                  <th className="px-4 py-3">Dato</th>
                  <th className="px-4 py-3">Barn</th>
                  <th className="px-4 py-3">Metode</th>
                  <th className="px-4 py-3">Belop</th>
                  <th className="px-4 py-3">Detaljer</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <Fragment key={payment.id}>
                    <tr key={payment.id} className="border-t border-slate-800 text-slate-100">
                      <td className="px-4 py-3">{new Date(payment.created_at).toLocaleString("nb-NO")}</td>
                      <td className="px-4 py-3">{payment.children?.[0]?.name ?? payment.child_id}</td>
                      <td className="px-4 py-3">{payment.method}</td>
                      <td className="px-4 py-3 font-semibold text-emerald-300">{formatKr(payment.amount_ore)}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => toggleExpanded(payment.id)}
                          className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
                        >
                          {expandedPayments[payment.id] ? "Skjul" : "Vis"}
                        </button>
                      </td>
                    </tr>
                    {expandedPayments[payment.id] && (
                      <tr key={`${payment.id}-details`} className="border-t border-slate-800 bg-slate-950">
                        <td className="px-4 py-4 text-sm text-slate-300" colSpan={5}>
                          <div className="space-y-2">
                            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Tilknyttede krav
                            </div>
                            {(paymentClaims[payment.id] ?? []).length === 0 ? (
                              <div className="text-sm text-slate-400">Ingen krav knyttet til denne utbetalingen.</div>
                            ) : (
                              <div className="space-y-2">
                                {(paymentClaims[payment.id] ?? []).map((claim) => (
                                  <div key={claim.id} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
                                    <div className="text-sm text-slate-200">
                                      {claim.tasks?.[0]?.title ?? claim.task_id}
                                    </div>
                                    <div className="text-sm font-semibold text-slate-100">{formatKr(claim.amount_ore)}</div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 md:p-5">
        <h3 className="mb-3 text-base font-semibold tracking-tight">Registrer utbetaling</h3>
        <div className="grid gap-3 md:grid-cols-3">
          <label className="space-y-1.5 text-sm">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Barn</span>
            <select
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100"
              value={selectedChildId}
              onChange={(e) => setSelectedChildId(e.target.value)}
            >
              <option value="">Velg barn</option>
              {children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5 text-sm">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Metode</span>
            <select
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100"
              value={method}
              onChange={(e) => setMethod(e.target.value as PaymentMethod)}
            >
              <option value="VIPPS">VIPPS</option>
              <option value="CASH">CASH</option>
              <option value="BANK">BANK</option>
              <option value="OTHER">OTHER</option>
            </select>
          </label>

          <label className="space-y-1.5 text-sm">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Notat</span>
            <input
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Valgfritt notat"
            />
          </label>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-800/70 text-slate-300">
            <tr>
              <th className="px-4 py-3">Velg</th>
              <th className="px-4 py-3">Oppgave</th>
              <th className="px-4 py-3">Belop</th>
              <th className="px-4 py-3">Tid</th>
            </tr>
          </thead>
          <tbody>
            {claims.map((claim) => (
              <tr key={claim.id} className="border-t border-slate-800 text-slate-100">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={Boolean(selectedIds[claim.id])}
                    onChange={() => toggleClaim(claim.id)}
                    className="h-4 w-4 cursor-pointer accent-slate-100"
                  />
                </td>
                <td className="px-4 py-3">{claim.tasks?.[0]?.title ?? claim.task_id}</td>
                <td className="px-4 py-3">{formatKr(claim.amount_ore)}</td>
                <td className="px-4 py-3">{new Date(claim.created_at).toLocaleString("nb-NO")}</td>
              </tr>
            ))}
            {claims.length === 0 && (
              <tr>
                <td className="px-4 py-10 text-center text-slate-400" colSpan={4}>
                  Ingen APPROVED krav for valgt barn.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <p className="text-sm text-slate-200">
          Valgt: {selectedClaimIds.length} krav. Sum: <strong>{formatKr(totalOre)}</strong>
        </p>
        <button
          type="button"
          disabled={submitting || selectedClaimIds.length === 0}
          onClick={() => void submitPayment()}
          className="rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Marker som betalt
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
