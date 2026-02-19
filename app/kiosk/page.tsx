import Link from "next/link";

export default function KioskInfoPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center">
        <h1 className="mb-2 text-2xl font-semibold tracking-tight">Kiosk</h1>
        <p className="text-sm text-slate-300">Skann QR-koden fra Admin - Enheter for aa koble denne iPaden til familieprofilene.</p>
        <Link href="/admin/devices" className="mt-4 inline-flex text-sm text-slate-100 underline underline-offset-4">
          Gaa til enheter
        </Link>
      </div>
    </main>
  );
}
