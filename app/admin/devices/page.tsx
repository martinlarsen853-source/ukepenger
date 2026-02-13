"use client";

import { useCallback, useEffect, useState } from "react";
import { getCurrentAdminContext } from "@/lib/family-client";
import { generateDeviceToken, hashToken } from "@/lib/device-session";
import { supabase } from "@/lib/supabaseClient";

type DeviceRow = {
  id: string;
  name: string;
  token_hash: string;
  revoked_at: string | null;
  created_at: string;
};

export default function AdminDevicesPage() {
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [devices, setDevices] = useState<DeviceRow[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [qrLink, setQrLink] = useState<string | null>(null);

  const loadDevices = useCallback(async (nextFamilyId?: string) => {
    const id = nextFamilyId ?? familyId;
    if (!id) return;

    const res = await supabase
      .from("devices")
      .select("id, name, token_hash, revoked_at, created_at")
      .eq("family_id", id)
      .order("created_at", { ascending: false });

    if (res.error) {
      setStatus(`Feil: ${res.error.message}`);
      return;
    }

    setDevices((res.data ?? []) as DeviceRow[]);
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
      await loadDevices(ctx.familyId);
      setLoading(false);
    };

    void run();
  }, [loadDevices]);

  const createDevice = async () => {
    if (!familyId) return;
    setCreating(true);
    setStatus("");
    setQrLink(null);

    const token = await generateDeviceToken();
    const tokenHash = await hashToken(token);

    const res = await supabase
      .from("devices")
      .insert({ family_id: familyId, token_hash: tokenHash })
      .select("id")
      .single();

    setCreating(false);

    if (res.error || !res.data) {
      setStatus(`Feil: ${res.error?.message ?? "Kunne ikke opprette enhet."}`);
      return;
    }

    const origin = typeof window !== "undefined" ? window.location.origin : "";
    setQrLink(`${origin}/kiosk?token=${token}`);
    await loadDevices();
  };

  const revokeDevice = async (deviceId: string) => {
    setStatus("");
    const res = await supabase
      .from("devices")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", deviceId);

    if (res.error) {
      setStatus(`Feil: ${res.error.message}`);
      return;
    }

    await loadDevices();
  };

  if (loading) return <div className="text-slate-300">Laster...</div>;

  const isError = status.startsWith("Feil:");

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold tracking-tight">Enheter</h2>
        <button
          type="button"
          onClick={() => void createDevice()}
          disabled={creating}
          className="rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {creating ? "Lager..." : "Lag ny enhet"}
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

      {qrLink && (
        <div className="rounded-2xl border border-amber-700/60 bg-amber-950/40 p-4 text-sm text-amber-200">
          <div className="mb-2 font-semibold">Ny enhet opprettet</div>
          <div className="mb-2 text-xs uppercase tracking-wide text-amber-300">QR-lenke (vises kun en gang)</div>
          <div className="break-all rounded-lg border border-amber-700/60 bg-amber-950/60 px-3 py-2 text-amber-100">
            {qrLink}
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-800/70 text-slate-300">
            <tr>
              <th className="px-4 py-3">Navn</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Opprettet</th>
              <th className="px-4 py-3">Handling</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((device) => (
              <tr key={device.id} className="border-t border-slate-800 text-slate-100">
                <td className="px-4 py-3">{device.name}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                      device.revoked_at ? "bg-slate-800 text-slate-300" : "bg-emerald-950/60 text-emerald-300"
                    }`}
                  >
                    {device.revoked_at ? "Deaktivert" : "Aktiv"}
                  </span>
                </td>
                <td className="px-4 py-3">{new Date(device.created_at).toLocaleString("nb-NO")}</td>
                <td className="px-4 py-3">
                  {device.revoked_at ? (
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
                <td className="px-4 py-10 text-center text-slate-400" colSpan={4}>
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