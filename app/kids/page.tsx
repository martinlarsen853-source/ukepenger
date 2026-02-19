"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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

export default function KidsPage() {
  const router = useRouter();
  const [children, setChildren] = useState<ChildRow[]>([]);
  const [status, setStatus] = useState("Laster...");
  const [showLoginLink, setShowLoginLink] = useState(false);

  useEffect(() => {
    const run = async () => {
      const res = await fetch("/api/kids/bootstrap", {
        method: "GET",
        credentials: "include",
      });
      const payload = (await res.json()) as { error?: string; children?: ChildRow[]; selectedChildId?: string | null };

      if (!res.ok || payload.error) {
        setStatus(payload.error ?? "Denne enheten er ikke koblet til en familie.");
        setShowLoginLink(true);
        return;
      }

      if (payload.selectedChildId) {
        router.replace(`/kids/${payload.selectedChildId}`);
        return;
      }

      setChildren(payload.children ?? []);
      setStatus("");
      setShowLoginLink(false);
    };

    void run();
  }, [router]);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 md:px-8 md:py-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-2 text-4xl font-black tracking-tight">Velg profil</h1>
        <p className="mb-6 text-sm text-slate-300">Trykk pa en profil for a vise oppgaver.</p>

        {status && (
          <div className="mb-6 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-300">
            <div>{status}</div>
            {showLoginLink && (
              <Link href="/login" className="mt-2 inline-flex text-slate-100 underline underline-offset-4">
                Gaa til login
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
        </div>

        {children.length === 0 && !status && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
            Ingen aktive barn tilgjengelig.
          </div>
        )}
      </div>
    </main>
  );
}
