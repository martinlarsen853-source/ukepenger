"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export function AcceptInviteButton({ token }: { token: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState("");

  const acceptInvite = async () => {
    setStatus("");
    setSubmitting(true);

    const sessionRes = await supabase.auth.getSession();
    const accessToken = sessionRes.data.session?.access_token;

    if (!accessToken) {
      setSubmitting(false);
      setStatus("Feil: Mangler innloggingstoken. Logg inn pa nytt.");
      return;
    }

    const response = await fetch("/api/invites/accept", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ token }),
    });

    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    setSubmitting(false);

    if (!response.ok) {
      setStatus(`Feil: ${payload.error ?? "Kunne ikke akseptere invitasjonen."}`);
      return;
    }

    router.replace("/admin/inbox");
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => void acceptInvite()}
        disabled={submitting}
        className="rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "Aksepterer..." : "Aksepter invitasjon"}
      </button>
      {status && <p className="text-sm text-red-300">{status}</p>}
    </div>
  );
}
