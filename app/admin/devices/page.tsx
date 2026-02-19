"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getCurrentAdminContext } from "@/lib/family-client";
import { supabase } from "@/lib/supabaseClient";

type DeviceRow = {
  id: string;
  name: string;
  device_code: string | null;
  active: boolean;
  revoked_at: string | null;
  created_at: string;
  updated_at?: string;
};

export default function AdminDevicesPage() {
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [devices, setDevices] = useState<DeviceRow[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [claimUrl, setClaimUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const loadDevices = useCallback(
    async (nextFamilyId?: string) => {
      const id = nextFamilyId ?? familyId;
      if (!id) return;

      const res = await supabase
        .from("devices")
        .select("id, name, device_code, active, revoked_at, created_at, updated_at")
        .eq("family_id", id)
        .order("created_at", { ascending: false });

      if (res.error) {
        setStatus(`Feil: ${res.error.message}`);
        return;
      }

      setDevices((res.data ?? []) as DeviceRow[]);
    },
    [familyId]
  );

  useEffect(() => {
    const run = async () => {
      const ctx = await getCurrentAdminContext();
      if (!ctx.familyId) {
        setStatus("Fant ikke familie.");
        setLoading(false);
        return;
      }

      setFamilyId(ctx.familyId);
      await loadDevices(ctx.familyId);
      setLoading(false);
    };

    void run();
  }, [loadDevices]);

  const openQr = async (regenerate: boolean) => {
    setBusy(true);
    setStatus("");
    setCopied(false);

    const sessionRes = await supabase.auth.getSession();
    const accessToken = sessionRes.data.session?.access_token;
    if (!accessToken) {
      setBusy(false);
      setStatus("Feil: Ikke innlogget.");
      return;
    }

    const res = await fetch("/api/admin/devices/qr", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ regenerate }),
    });

    const payload = (await res.json()) as { error?: string; claimUrl?: string };
    setBusy(false);

    if (!res.ok || payload.error || !payload.claimUrl) {
      setStatus(`Feil: ${payload.error ?? "Kunne ikke lage QR-lenke."}`);
      return;
    }

    setClaimUrl(payload.claimUrl);
    setStatus(regenerate ? "QR regenerert." : "QR klar.");
    await loadDevices();
  };

  const revokeDevice = async (deviceId: string) => {
    setStatus("");
    const res = await supabase
      .from("devices")
      .update({ revoked_at: new Date().toISOString(), active: false, updated_at: new Date().toISOString() })
      .eq("id", deviceId);

    if (res.error) {
      setStatus(`Feil: ${res.error.message}`);
      return;
    }

    await loadDevices();
  };

  const qrImageUrl = useMemo(() => {
    if (!claimUrl) return null;
    return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(claimUrl)}`;
  }, [claimUrl]);

  if (loading) return <div className="text-slate-300">Laster...</div>;

  const isError = status.startsWith("Feil:");

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <h3 className="mb-2 text-base font-semibold tracking-tight">Kiosk QR</h3>
        <p className="mb-4 text-sm text-slate-300">Vis QR pa forelders telefon, skann pa iPad, og barnet lander rett pa /kids.</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void openQr(false)}
            disabled={busy}
            className="rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "Lager..." : "Vis QR"}
          </button>
          <button
            type="button"
            onClick={() => void openQr(true)}
            disabled={busy}
            className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Regenerer QR
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

      {claimUrl && (
        <div className="rounded-2xl border border-amber-700/60 bg-amber-950/40 p-4 text-sm text-amber-100">
          <div className="mb-3 text-sm font-semibold text-amber-200">Skann QR med iPad</div>
          {qrImageUrl && <img src={qrImageUrl} alt="Kiosk QR" className="h-[260px] w-[260px] rounded-lg border border-amber-700/70 bg-white p-2" />}
          <div className="mt-3 break-all rounded-lg border border-amber-700/60 bg-amber-950/60 px-3 py-2 text-xs">{claimUrl}</div>
          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(claimUrl);
              setCopied(true);
            }}
            className="mt-2 rounded-lg border border-amber-700/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-amber-100 transition hover:border-amber-500 hover:bg-amber-900/50"
          >
            {copied ? "Kopiert" : "Kopier lenke"}
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-800/70 text-slate-300">
            <tr>
              <th className="px-4 py-3">Navn</th>
              <th className="px-4 py-3">Kode</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Opprettet</th>
              <th className="px-4 py-3">Handling</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((device) => (
              <tr key={device.id} className="border-t border-slate-800 text-slate-100">
                <td className="px-4 py-3">{device.name}</td>
                <td className="px-4 py-3 font-mono text-xs">{device.device_code ?? "-"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                      !device.active || device.revoked_at ? "bg-slate-800 text-slate-300" : "bg-emerald-950/60 text-emerald-300"
                    }`}
                  >
                    {!device.active || device.revoked_at ? "Deaktivert" : "Aktiv"}
                  </span>
                </td>
                <td className="px-4 py-3">{new Date(device.created_at).toLocaleString("nb-NO")}</td>
                <td className="px-4 py-3">
                  {!device.active || device.revoked_at ? (
                    <span className="text-xs text-slate-500">Ingen handling</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void revokeDevice(device.id)}
                      className="rounded-lg border border-red-700/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-red-200 transition hover:border-red-500 hover:bg-red-950"
                    >
                      Deaktiver
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {devices.length === 0 && (
              <tr>
                <td className="px-4 py-10 text-center text-slate-400" colSpan={5}>
                  Ingen enheter opprettet enda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
