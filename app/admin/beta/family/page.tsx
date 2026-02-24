"use client";

import Link from "next/link";

export default function AdminBetaFamilyPage() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Familie (beta)</h2>
        <p className="mt-1 text-sm text-slate-400">Under utvikling.</p>
      </div>
      <Link
        href="/admin/beta/members"
        className="inline-flex rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-900"
      >
        Gå til medlemmer (beta)
      </Link>
    </section>
  );
}
