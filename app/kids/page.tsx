"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAvatarByKey } from "@/lib/avatars";

type ChildRow = {
  id: string;
  name: string;
  avatar_key: string | null;
  color?: string | null;
};

const cardColors = [
  "from-cyan-500 to-blue-500",
  "from-emerald-500 to-lime-500",
  "from-orange-500 to-amber-500",
  "from-fuchsia-500 to-pink-500",
  "from-violet-500 to-indigo-500",
  "from-rose-500 to-red-500",
];

const PRICE_OPTIONS = [
  { label: "5 kr", ore: 500 },
  { label: "10 kr", ore: 1000 },
  { label: "20 kr", ore: 2000 },
  { label: "30 kr", ore: 3000 },
  { label: "40 kr", ore: 4000 },
  { label: "50 kr", ore: 5000 },
];

type ButikkStep = "price" | "child";

export default function KidsPage() {
  const [children, setChildren] = useState<ChildRow[]>([]);
  const [status, setStatus] = useState("Laster...");
  const [showKioskLink, setShowKioskLink] = useState(false);

  const [butikkOpen, setButikkOpen] = useState(false);
  const [butikkStep, setButikkStep] = useState<ButikkStep>("price");
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [butikkLoading, setButikkLoading] = useState(false);
  const [butikkStatus, setButikkStatus] = useState("");

  useEffect(() => {
    const run = async () => {
      const res = await fetch("/api/kids/bootstrap", {
        method: "GET",
        credentials: "include",
      });
      const payload = (await res.json()) as { error?: string; children?: ChildRow[] };

      if (!res.ok || payload.error) {
        setStatus(payload.error ?? "Kiosk-session mangler eller er ugyldig.");
        setShowKioskLink(true);
        return;
      }

      setChildren(payload.children ?? []);
      setStatus("");
      setShowKioskLink(false);
    };

    void run();
  }, []);

  const openButikk = () => {
    setButikkOpen(true);
    setButikkStep("price");
    setSelectedPrice(null);
    setButikkStatus("");
  };

  const closeButikk = () => {
    if (butikkLoading) return;
    setButikkOpen(false);
  };

  const selectPrice = (ore: number) => {
    setSelectedPrice(ore);
    setButikkStep("child");
    setButikkStatus("");
  };

  const registerSale = async (childId: string) => {
    if (!selectedPrice) return;
    setButikkLoading(true);
    setButikkStatus("");

    const res = await fetch("/api/kids/butikk", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ childId, amountOre: selectedPrice }),
    });

    const payload = (await res.json()) as { error?: string; ok?: boolean };
    setButikkLoading(false);

    if (!res.ok || payload.error) {
      setButikkStatus(`Feil: ${payload.error ?? "Noe gikk galt."}`);
      return;
    }

    const child = children.find((c) => c.id === childId);
    const priceLabel = PRICE_OPTIONS.find((p) => p.ore === selectedPrice)?.label ?? "";
    setButikkStatus(`${priceLabel} lagt til ${child?.name ?? "barnet"}!`);

    setTimeout(() => {
      setButikkOpen(false);
      setButikkStatus("");
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 md:px-8 md:py-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-2 text-4xl font-black tracking-tight">Velg profil</h1>
        <p className="mb-6 text-sm text-slate-300">Trykk pa en profil for a vise oppgaver.</p>

        {status && (
          <div className="mb-6 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-300">
            <div>{status}</div>
            {showKioskLink && (
              <Link href="/kiosk" className="mt-2 inline-flex text-slate-100 underline underline-offset-4">
                Gaa til kiosk
              </Link>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {children.map((child, index) => {
            const avatar = getAvatarByKey(child.avatar_key);
            const gradient = cardColors[index % cardColors.length];
            return (
              <Link
                key={child.id}
                href={`/kids/${child.id}`}
                className={`group rounded-2xl border border-slate-700 bg-gradient-to-br ${gradient} p-6 text-slate-950 shadow-lg transition hover:-translate-y-1 hover:shadow-2xl`}
              >
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/80 text-3xl">
                  {avatar.emoji}
                </div>
                <div className="text-2xl font-black tracking-tight">{child.name}</div>
                <div className="mt-2 text-sm font-semibold text-slate-900/80 group-hover:text-slate-900">Trykk for a fortsette</div>
              </Link>
            );
          })}

          {children.length > 0 && (
            <button
              type="button"
              onClick={openButikk}
              className="group rounded-2xl border-2 border-dashed border-slate-600 bg-slate-900/60 p-6 text-left shadow-lg transition hover:-translate-y-1 hover:border-slate-400 hover:bg-slate-800/80 hover:shadow-2xl"
            >
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-800 text-3xl group-hover:bg-slate-700">
                🛍️
              </div>
              <div className="text-2xl font-black tracking-tight text-slate-100">Butikk</div>
              <div className="mt-2 text-sm font-semibold text-slate-400 group-hover:text-slate-300">Registrer et salg</div>
            </button>
          )}
        </div>

        {children.length === 0 && !status && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
            Ingen aktive barn tilgjengelig.
          </div>
        )}
      </div>

      {butikkOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-100">Butikk</h2>
                <p className="mt-0.5 text-sm text-slate-400">
                  {butikkStep === "price" ? "Velg belop" : "Hvem solgte?"}
                </p>
              </div>
              <button
                type="button"
                onClick={closeButikk}
                disabled={butikkLoading}
                className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-400 transition hover:border-slate-500 hover:text-slate-200 disabled:opacity-40"
              >
                Avbryt
              </button>
            </div>

            {butikkStep === "price" && (
              <div className="grid grid-cols-3 gap-3">
                {PRICE_OPTIONS.map((option) => (
                  <button
                    key={option.ore}
                    type="button"
                    onClick={() => selectPrice(option.ore)}
                    className="rounded-xl border border-slate-700 bg-slate-800 py-4 text-xl font-black text-slate-100 transition hover:border-emerald-500 hover:bg-emerald-900/30 hover:text-emerald-300 active:scale-95"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}

            {butikkStep === "child" && (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => { setButikkStep("price"); setButikkStatus(""); }}
                  className="mb-1 text-sm text-slate-400 hover:text-slate-200"
                >
                  ← Endre belop ({PRICE_OPTIONS.find((p) => p.ore === selectedPrice)?.label})
                </button>

                <div className="grid grid-cols-2 gap-3">
                  {children.map((child, index) => {
                    const avatar = getAvatarByKey(child.avatar_key);
                    const gradient = cardColors[index % cardColors.length];
                    return (
                      <button
                        key={child.id}
                        type="button"
                        disabled={butikkLoading}
                        onClick={() => void registerSale(child.id)}
                        className={`rounded-xl bg-gradient-to-br ${gradient} p-4 text-left text-slate-950 shadow transition hover:-translate-y-0.5 hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-60`}
                      >
                        <div className="mb-2 text-2xl">{avatar.emoji}</div>
                        <div className="text-base font-black">{child.name}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {butikkStatus && (
              <p
                className={`mt-4 rounded-lg border px-3 py-2 text-sm ${
                  butikkStatus.startsWith("Feil:")
                    ? "border-red-800 bg-red-950/40 text-red-200"
                    : "border-emerald-800 bg-emerald-950/40 text-emerald-200"
                }`}
              >
                {butikkStatus}
              </p>
            )}

            {butikkLoading && (
              <p className="mt-4 text-center text-sm text-slate-400">Registrerer...</p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
