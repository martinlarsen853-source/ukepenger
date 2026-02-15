"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { hashToken, setDeviceSessionCookie } from "@/lib/device-session";
import { supabase } from "@/lib/supabaseClient";

type DeviceRow = {
  id: string;
  family_id: string;
  revoked_at: string | null;
  token_hash: string;
};

function KioskPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [status, setStatus] = useState("Laster...");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (!token) {
        setIsError(true);
        setStatus("Mangler token. Skann QR-koden fra admin.");
        return;
      }

      const tokenHash = await hashToken(token);
      const res = await supabase
        .from("devices")
        .select("id, family_id, revoked_at, token_hash")
        .eq("token_hash", tokenHash)
        .maybeSingle();

      if (res.error || !res.data) {
        setIsError(true);
        setStatus("Ugyldig eller utgaatt lenke.");
        return;
      }

      const device = res.data as DeviceRow;
      if (device.revoked_at) {
        setIsError(true);
        setStatus("Denne enheten er deaktivert.");
        return;
      }

      if (device.token_hash !== tokenHash) {
        setIsError(true);
        setStatus("Ugyldig enhet.");
        return;
      }

      setDeviceSessionCookie({ deviceId: device.id, familyId: device.family_id, tokenHash });
      setIsError(false);
      setStatus("Enhet aktivert. Videresender...");
      router.replace("/kids");
    };

    void run();
  }, [router, token]);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center">
        <h1 className="mb-2 text-2xl font-semibold tracking-tight">Kiosk-aktivering</h1>
        <p
          className={`mt-4 rounded-lg border px-3 py-2 text-sm ${
            isError
              ? "border-red-800 bg-red-950/40 text-red-200"
              : "border-emerald-800 bg-emerald-950/40 text-emerald-200"
          }`}
        >
          {status}
        </p>
        {isError && (
          <div className="mt-4 text-sm text-slate-400">
            <Link href="/kiosk" className="text-slate-100 underline underline-offset-4">
              Skann QR-kode
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

export default function KioskPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100" />}>
      <KioskPageContent />
    </Suspense>
  );
}
