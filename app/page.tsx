import Link from "next/link";
import HeroDeviceDemo from "@/app/components/HeroDeviceDemo";
import DeviceFrame from "@/app/components/DeviceFrame";

function FeatureDemoTasks() {
  return (
    <DeviceFrame>
      <div className="space-y-2 text-sm">
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="font-medium text-slate-900">Rydde rom</p>
          <p className="text-slate-600">5 kr</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="font-medium text-slate-900">Tomme oppvaskmaskin</p>
          <p className="text-slate-600">10 kr</p>
        </div>
        <button className="w-full rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white">Send krav</button>
      </div>
    </DeviceFrame>
  );
}

function FeatureDemoInbox() {
  return (
    <DeviceFrame>
      <div className="space-y-2 text-sm">
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="font-medium text-slate-900">Noah | Rydde rom</p>
          <p className="text-slate-600">5 kr</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="font-medium text-slate-900">Maja | Tomme oppvaskmaskin</p>
          <p className="text-slate-600">10 kr</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button className="rounded-xl bg-emerald-500 px-3 py-2.5 text-sm font-semibold text-white">Godkjenn</button>
          <button className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700">Avvis</button>
        </div>
      </div>
    </DeviceFrame>
  );
}

function FeatureDemoPayout() {
  return (
    <DeviceFrame>
      <div className="space-y-2 text-sm">
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="font-medium text-slate-900">Til gode</p>
          <p className="text-slate-600">25 kr</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="font-medium text-slate-900">Metode</p>
          <p className="text-slate-600">Kontanter</p>
        </div>
        <button className="w-full rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white">Utbetal naar det passer</button>
      </div>
    </DeviceFrame>
  );
}

function FeatureDemoWishlist() {
  return (
    <DeviceFrame>
      <div className="space-y-3 text-sm">
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="flex items-center justify-between">
            <p className="font-medium text-slate-900">Sparemaal</p>
            <p className="text-slate-500">400 kr</p>
          </div>
          <p className="mt-1 text-slate-600">Ny sykkel</p>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full w-[62%] rounded-full bg-emerald-500 [animation:wishlistGrow_1.2s_ease-out_forwards]" />
          </div>
          <p className="mt-2 text-xs text-slate-500">Mangler 150 kr</p>
        </div>
      </div>
    </DeviceFrame>
  );
}

export default function HomePage() {
  return (
    <main className="bg-slate-50 text-slate-900">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 top-20 h-[24rem] w-[24rem] rounded-full bg-cyan-500/15 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl gap-14 px-4 py-28 md:py-32 lg:grid-cols-2 lg:items-center">
          <div className="max-w-[520px]">
            <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-[0.14em] text-slate-200">
              FAMILIEAPP
            </p>
            <h1 className="mt-6 text-5xl font-semibold leading-[1.02] tracking-tight md:text-6xl">Full kontroll paa ukepenger</h1>
            <p className="mt-6 text-lg text-slate-300 md:text-xl">Barn registrerer oppgaver. Du godkjenner og betaler.</p>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Link
                href="/login"
                className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/40 transition hover:brightness-110"
              >
                Kom i gang
              </Link>
              <Link href="#how" className="text-sm font-semibold text-slate-300 transition hover:text-white hover:underline underline-offset-4">
                Se hvordan det funker
              </Link>
            </div>
          </div>
          <HeroDeviceDemo />
        </div>
      </section>

      <section className="border-t border-white/10 bg-slate-900 py-6 text-slate-300">
        <div className="mx-auto grid max-w-6xl gap-3 px-4 text-sm md:grid-cols-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-500/10 text-[10px] text-emerald-300">v</span>
            <span>Enkelt oppsett</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-500/10 text-[10px] text-emerald-300">v</span>
            <span>Mobilvennlig</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-500/10 text-[10px] text-emerald-300">v</span>
            <span>Full historikk</span>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 md:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Barn registrerer oppgaver</h2>
            <p className="mt-4 text-slate-600">Barn velger oppgaver og sender krav paa sekunder.</p>
          </div>
          <FeatureDemoTasks />
        </div>
      </section>

      <section className="bg-slate-50 py-20 md:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 md:grid-cols-2">
          <div className="md:order-2">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Du godkjenner paa sekunder</h2>
            <p className="mt-4 text-slate-600">Se hva som er sendt, og svar med ett trykk.</p>
          </div>
          <div className="md:order-1">
            <FeatureDemoInbox />
          </div>
        </div>
      </section>

      <section className="bg-white py-20 md:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Utbetal naar det passer</h2>
            <p className="mt-4 text-slate-600">Betal ut naar det passer familien og behold oversikten.</p>
          </div>
          <FeatureDemoPayout />
        </div>
      </section>

      <section className="bg-slate-50 py-20 md:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 md:grid-cols-2">
          <div className="md:order-2">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Spar til noe du oensker deg</h2>
            <p className="mt-4 text-slate-600">Barn ser maalet sitt og hvor mye som mangler.</p>
          </div>
          <div className="md:order-1">
            <FeatureDemoWishlist />
          </div>
        </div>
      </section>

      <section className="bg-white py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 md:p-12">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">For familier som vil ha kontroll</h2>
            <p className="mt-4 max-w-2xl text-slate-600">Mindre mas, mer oversikt, og tydelige rammer for alle hjemme.</p>

            <div className="relative mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-200 via-slate-100 to-emerald-100/40" style={{ aspectRatio: "16 / 7" }}>
              <div className="absolute inset-0 opacity-35" style={{ backgroundImage: "repeating-linear-gradient(45deg, rgba(15,23,42,0.06) 0px, rgba(15,23,42,0.06) 1px, transparent 1px, transparent 8px)" }} />
              <div className="absolute inset-0 flex items-end p-6 md:p-8">
                <p className="max-w-xl rounded-xl bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-sm">
                  "Vi fikk roligere hverdager etter at barna kunne sende krav selv."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="bg-slate-50 py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Slik funker det</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-slate-200 bg-white p-6">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-sm font-semibold text-white">1</span>
              <h3 className="mt-4 text-lg font-semibold">Velg oppgaver</h3>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-6">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-sm font-semibold text-white">2</span>
              <h3 className="mt-4 text-lg font-semibold">Barn sender krav</h3>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-6">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-sm font-semibold text-white">3</span>
              <h3 className="mt-4 text-lg font-semibold">Du godkjenner og utbetaler</h3>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-slate-950 py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="rounded-3xl border border-white/10 bg-slate-900 p-8 text-center md:p-12">
            <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">Kom i gang paa 2 minutter</h2>
            <p className="mt-3 text-slate-300">Gratis aa bruke.</p>
            <Link
              href="/login"
              className="mt-6 inline-flex rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/40 transition hover:brightness-110"
            >
              Kom i gang
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes deviceFloat {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes wishlistGrow {
          0% {
            width: 0%;
          }
          100% {
            width: 62%;
          }
        }
      `}</style>
    </main>
  );
}
