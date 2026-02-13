"use client"

import React, { useMemo, useState } from "react"
import Papa from "papaparse"

type Tx = {
  date: Date | null
  text: string
  amount: number
  raw: Record<string, unknown>
}

type Baseline = {
  createdAt: string
  months: string[]
  monthlyExpenseAvg: number
  byCategoryAvg: Record<string, number>
  subscriptionsAvg: number
  subs: { key: string; name: string; avgAmount: number; count: number }[]
}

type MonthlySnapshot = {
  month: string
  expense: number
  baseline: number
  saved: number
  createdAt: string
}

const LS_BASELINE = "spareapp_baseline_v1"
const LS_MONTHLY_HISTORY = "spareapp_monthly_history_v1"

function norm(s: string) {
  return (s ?? "").toString().trim().toLowerCase()
}

function pickFirstKey(obj: Record<string, unknown>, candidates: string[]) {
  const keys = Object.keys(obj || {})
  const nk = keys.map((k) => [k, norm(k)] as const)
  for (const c of candidates) {
    const nc = norm(c)
    const hit = nk.find(([, n]) => n === nc)
    if (hit) return hit[0]
  }
  for (const c of candidates) {
    const nc = norm(c)
    const hit = nk.find(([, n]) => n.includes(nc))
    if (hit) return hit[0]
  }
  return null
}

function parseDateMaybe(v: unknown): Date | null {
  if (!v) return null
  const s = v.toString().trim()
  const d1 = new Date(s)
  if (!isNaN(d1.getTime())) return d1
  const m = s.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/)
  if (m) {
    const dd = parseInt(m[1], 10)
    const mm = parseInt(m[2], 10) - 1
    let yy = parseInt(m[3], 10)
    if (yy < 100) yy += 2000
    const d2 = new Date(yy, mm, dd)
    if (!isNaN(d2.getTime())) return d2
  }
  return null
}

function toMonthKey(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  return `${y}-${m}`
}

function absRound(n: number) {
  return Math.round(n * 100) / 100
}

function formatNOK(n: number) {
  return Math.round(n).toLocaleString("nb-NO") + " kr"
}

function classify(text: string): string {
  const t = norm(text)
  if (/(wolt|foodora|just eat|uber eats|bolt food|pizzabakeren|domino)/.test(t)) return "Takeaway"
  if (/(rema|kiwi|coop|meny|spar|joker|bunnpris|obs)/.test(t)) return "Dagligvare"
  if (/(vy|ruter|entur|flytoget|sas|norwegian|wideroe|taxi|uber|bolt)/.test(t)) return "Transport"
  if (/(spotify|netflix|hbo|max|viaplay|disney|prime video|youtube|tidal|storytel|bookbeat)/.test(t)) return "Abonnement"
  if (/(sats|elixia|fresh fitness|impulse|crossfit)/.test(t)) return "Trening"
  if (/(gjensidige|if|tryg|fremtind|dnb forsikring|storebrand|enter forsikring)/.test(t)) return "Forsikring"
  if (/(telenor|telia|ice|onecall|talkmore|chilimobil|mycall)/.test(t)) return "Mobil/Internett"
  if (/(fjordkraft|tibber|hafslund|fortum|norgesenergi|lyse|bkk)/.test(t)) return "Strøm"
  if (/(vinmonopolet|bar|pub|restaurant|cafe|espresso house|starbucks)/.test(t)) return "Ute/Kaffe"
  if (/(klarna|afterpay|collector|komplett bank|resurs|santander|kreditt)/.test(t)) return "Kreditt/Delbetaling"
  return "Annet"
}

function merchantKey(text: string) {
  return norm(text)
    .replace(/\d+/g, "")
    .replace(/[\.,\-_\/\\#*()\[\]:;]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 40)
}

function detectSubscriptions(txs: Tx[]) {
  const expenses = txs.filter((t) => t.amount < 0 && t.date)
  const groups = new Map<string, Tx[]>()
  for (const tx of expenses) {
    const text = norm(tx.text)
    if (/(overføring|kontoregulering|sparing|husleie|egen konto|fast oppdrag|mellom egne konti)/.test(text)) continue
    const k = merchantKey(tx.text)
    if (!k) continue
    if (!groups.has(k)) groups.set(k, [])
    groups.get(k)!.push(tx)
  }

  const subs: { key: string; name: string; avgAmount: number; count: number }[] = []
  for (const [k, g] of groups.entries()) {
    if (g.length < 3) continue
    g.sort((a, b) => a.date!.getTime() - b.date!.getTime())
    const amounts = g.map((x) => Math.abs(x.amount))
    const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length

    const diffs = []
    for (let i = 1; i < g.length; i++) {
      diffs.push((g[i].date!.getTime() - g[i - 1].date!.getTime()) / (1000 * 60 * 60 * 24))
    }
    const monthlyish = diffs.filter((d) => d >= 20 && d <= 40).length >= Math.floor(diffs.length * 0.5)
    const stable = amounts.filter((a) => Math.abs(a - avg) / avg <= 0.15).length >= Math.floor(amounts.length * 0.6)

    if (monthlyish && stable && avg >= 30) {
      subs.push({ key: k, name: g[0].text, avgAmount: absRound(avg), count: g.length })
    }
  }

  return subs.sort((a, b) => b.avgAmount - a.avgAmount).slice(0, 12)
}

function expenseByMonth(txs: Tx[]) {
  const m = new Map<string, number>()
  for (const t of txs) {
    if (!t.date || t.amount >= 0) continue
    const mk = toMonthKey(t.date)
    m.set(mk, (m.get(mk) ?? 0) + Math.abs(t.amount))
  }
  return m
}

function expenseByCategoryMonthly(txs: Tx[]) {
  const out = new Map<string, Map<string, number>>()
  for (const t of txs) {
    if (!t.date || t.amount >= 0) continue
    const mk = toMonthKey(t.date)
    const cat = classify(t.text)
    if (!out.has(mk)) out.set(mk, new Map())
    const mm = out.get(mk)!
    mm.set(cat, (mm.get(cat) ?? 0) + Math.abs(t.amount))
  }
  return out
}

export default function Home() {
  const [fileName, setFileName] = useState("")
  const [txs, setTxs] = useState<Tx[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<"baseline" | "monthly">("baseline")

  const [baseline, setBaseline] = useState<Baseline | null>(() => {
    try {
      const raw = localStorage.getItem(LS_BASELINE)
      return raw ? (JSON.parse(raw) as Baseline) : null
    } catch {
      return null
    }
  })

  const [history, setHistory] = useState<MonthlySnapshot[]>(() => {
    try {
      const raw = localStorage.getItem(LS_MONTHLY_HISTORY)
      return raw ? (JSON.parse(raw) as MonthlySnapshot[]) : []
    } catch {
      return []
    }
  })

  const handleFile = async (file: File) => {
    setError(null)
    setFileName(file.name)
    const text = await file.text()

    const parsed = Papa.parse(text, { header: true, skipEmptyLines: true })
    if (parsed.errors?.length) {
      setError(parsed.errors[0].message)
      return
    }

    const rows = ((parsed.data || []) as Record<string, unknown>[]).filter(Boolean)
    if (rows.length === 0) {
      setError("Fant ingen rader i CSV.")
      return
    }

    const sample = rows[0]
    const dateKey = pickFirstKey(sample, ["dato", "date", "bokføringsdato", "transaksjonsdato"])
    const textKey = pickFirstKey(sample, ["tekst", "beskrivelse", "description", "mottaker", "merchant", "tittel", "forklaring"])
    const expenseKey = pickFirstKey(sample, ["ut fra konto", "ut", "debet", "utgift"])
    const incomeKey = pickFirstKey(sample, ["inn på konto", "inn", "kredit", "inntekt"])
    const amountKey = !expenseKey && !incomeKey ? pickFirstKey(sample, ["beløp", "belop", "amount", "sum", "kr"]) : null

    if (!dateKey || !textKey || (!amountKey && !expenseKey && !incomeKey)) {
      setError(`Klarte ikke å finne kolonner. Fant: ${Object.keys(sample).join(", ")}`)
      return
    }

    const txsParsed: Tx[] = rows.map((r: Record<string, unknown>) => {
      const d = parseDateMaybe(r[dateKey])
      const txt = (r[textKey] ?? "").toString()
      let amount = 0

      if (expenseKey || incomeKey) {
        let expenseRaw = expenseKey ? (r[expenseKey] ?? "").toString().trim() : "0"
        let incomeRaw = incomeKey ? (r[incomeKey] ?? "").toString().trim() : "0"
        expenseRaw = expenseRaw.replace(/\s/g, "").replace(",", ".").replace(/kr/gi, "")
        incomeRaw = incomeRaw.replace(/\s/g, "").replace(",", ".").replace(/kr/gi, "")
        const expense = Number(expenseRaw) || 0
        const income = Number(incomeRaw) || 0
        amount = income - expense
      } else if (amountKey) {
        let amtRaw = (r[amountKey] ?? "").toString().trim()
        amtRaw = amtRaw.replace(/\s/g, "").replace(",", ".").replace(/kr/gi, "")
        amount = Number(amtRaw) || 0
      }

      return { date: d, text: txt, amount: isNaN(amount) ? 0 : amount, raw: r }
    })

    const cleaned = txsParsed.filter((t) => t.date && t.text && t.amount !== 0)
    if (cleaned.length < 10) {
      setError("For få gyldige transaksjoner. Sjekk CSV-format.")
      return
    }
    setTxs(cleaned)
  }

  const computed = useMemo(() => {
    if (!txs) return null
    const expM = expenseByMonth(txs)
    const months = Array.from(expM.keys()).sort()
    const monthlyExpenses = months.map((m) => expM.get(m) ?? 0)
    const monthlyAvg = monthlyExpenses.reduce((a, b) => a + b, 0) / Math.max(1, monthlyExpenses.length)

    const catMonthly = expenseByCategoryMonthly(txs)
    const cats = new Map<string, number[]>()
    for (const m of months) {
      const mm = catMonthly.get(m) ?? new Map<string, number>()
      for (const [cat, val] of mm.entries()) {
        if (!cats.has(cat)) cats.set(cat, [])
        cats.get(cat)!.push(val)
      }
    }

    const byCatAvg: Record<string, number> = {}
    for (const [cat, arr] of cats.entries()) byCatAvg[cat] = absRound(arr.reduce((a, b) => a + b, 0) / arr.length)

    const subs = detectSubscriptions(txs)
    const subsAvg = subs.reduce((a, s) => a + s.avgAmount, 0)
    const base = monthlyAvg
    const lite = Math.min(2000, Math.max(100, Math.round(base * 0.05)))
    const middels = Math.min(5000, Math.max(500, Math.round(base * 0.12)))
    const mye = Math.min(10000, Math.max(1000, Math.round(base * 0.25)))

    return {
      months,
      monthlyAvg: absRound(monthlyAvg),
      byCatAvg,
      topCats: Object.entries(byCatAvg).sort((a, b) => b[1] - a[1]).slice(0, 6),
      subs,
      subsAvg: absRound(subsAvg),
      targets: { lite, middels, mye },
    }
  }, [txs])

  const monthlyCompare = useMemo(() => {
    if (!txs || !baseline) return null
    const expM = expenseByMonth(txs)
    const months = Array.from(expM.keys()).sort()
    const last = months[months.length - 1]
    const thisExp = last ? (expM.get(last) ?? 0) : 0
    return { month: last ?? "Ukjent", thisExp, saved: baseline.monthlyExpenseAvg - thisExp }
  }, [txs, baseline])

  const planCards = useMemo(() => {
    if (!computed) return null
    const makePlan = (target: number) => {
      const actions: { title: string; amount: number; why: string }[] = []
      if (computed.subs.length) {
        const s = computed.subs[0]
        actions.push({ title: `Vurder å kutte: ${s.name}`, amount: Math.min(target, Math.round(s.avgAmount)), why: `Gjentakende trekk (~${formatNOK(s.avgAmount)}/mnd).` })
      }
      const take = computed.byCatAvg["Takeaway"] ?? 0
      if (take > 0) actions.push({ title: "Reduser takeaway", amount: Math.min(target, Math.round(take * 0.3)), why: `Snitt ~${formatNOK(take)}/mnd.` })
      const ute = computed.byCatAvg["Ute/Kaffe"] ?? 0
      if (ute > 0) actions.push({ title: "Kutt litt i kaffe/ute", amount: Math.min(target, Math.round(ute * 0.25)), why: `Snitt ~${formatNOK(ute)}/mnd.` })
      const annet = computed.byCatAvg["Annet"] ?? 0
      if (annet > 0) actions.push({ title: "Sett tak på småkjøp (Annet)", amount: Math.min(target, Math.round(annet * 0.1)), why: `Snitt ~${formatNOK(annet)}/mnd.` })
      const total = actions.reduce((a, x) => a + x.amount, 0)
      const remaining = Math.max(0, target - total)
      if (remaining > 0) actions.push({ title: "Bonus: reforhandle én fast utgift", amount: remaining, why: "Forsikring/strøm/mobil kan ofte senkes." })
      return actions.slice(0, 5)
    }
    return { lite: makePlan(computed.targets.lite), middels: makePlan(computed.targets.middels), mye: makePlan(computed.targets.mye) }
  }, [computed])

  const saveBaseline = () => {
    if (!computed) return
    const b: Baseline = {
      createdAt: new Date().toISOString(),
      months: computed.months,
      monthlyExpenseAvg: computed.monthlyAvg,
      byCategoryAvg: computed.byCatAvg,
      subscriptionsAvg: computed.subsAvg,
      subs: computed.subs,
    }
    setBaseline(b)
    localStorage.setItem(LS_BASELINE, JSON.stringify(b))
    setMode("monthly")
    setTxs(null)
    setFileName("")
  }

  const clearBaseline = () => {
    setBaseline(null)
    localStorage.removeItem(LS_BASELINE)
  }

  const saveMonthlySnapshot = () => {
    if (!monthlyCompare || !baseline) return
    const row: MonthlySnapshot = {
      month: monthlyCompare.month,
      expense: absRound(monthlyCompare.thisExp),
      baseline: absRound(baseline.monthlyExpenseAvg),
      saved: absRound(monthlyCompare.saved),
      createdAt: new Date().toISOString(),
    }
    const withoutThis = history.filter((h) => h.month !== row.month)
    const next = [...withoutThis, row].sort((a, b) => a.month.localeCompare(b.month))
    setHistory(next)
    localStorage.setItem(LS_MONTHLY_HISTORY, JSON.stringify(next))
  }

  const yearToDate = useMemo(() => {
    const year = String(new Date().getFullYear())
    const rows = history.filter((h) => h.month.startsWith(year))
    return rows.reduce((sum, r) => sum + r.saved, 0)
  }, [history])

  const historyMaxExpense = useMemo(() => {
    if (!history.length) return 1
    return Math.max(...history.map((h) => h.expense), ...history.map((h) => h.baseline), 1)
  }, [history])

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="px-6 pt-20 pb-14">
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">Få kontroll på økonomien din</h1>
          <p className="mx-auto mb-10 max-w-3xl text-lg leading-relaxed text-slate-300 md:text-xl">
            Last opp bankutskrift som CSV. Bygg baseline fra flere måneder, og følg deretter sparingen måned for måned.
          </p>

          <div className="mx-auto flex max-w-md flex-col items-center gap-4">
            <div className="relative w-full">
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFile(e.target.files[0])
                }}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
              <div className="cursor-pointer rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-5 text-lg font-bold shadow-2xl transition-all duration-300 hover:scale-105">
                Last opp bankutskrift
              </div>
            </div>
            {fileName && <p className="rounded-xl border border-slate-600/50 bg-slate-700/50 px-5 py-3 text-sm">{fileName}</p>}
            {error && <p className="w-full rounded-xl border border-red-700/50 bg-red-900/50 px-5 py-3 text-sm text-red-200">{error}</p>}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => setMode("baseline")}
              className={`rounded-xl px-6 py-3 font-semibold transition ${mode === "baseline" ? "bg-white text-slate-900" : "border border-slate-600 bg-slate-800/60 text-white hover:bg-slate-700/60"}`}
            >
              1) Baseline
            </button>
            <button
              onClick={() => setMode("monthly")}
              disabled={!baseline}
              title={!baseline ? "Lag baseline først" : ""}
              className={`rounded-xl px-6 py-3 font-semibold transition ${mode === "monthly" ? "bg-white text-slate-900" : "border border-slate-600 bg-slate-800/60 text-white hover:bg-slate-700/60"} disabled:cursor-not-allowed disabled:opacity-50`}
            >
              2) Månedlig oppfølging
            </button>
            {baseline && (
              <button onClick={clearBaseline} className="rounded-xl border border-slate-600 bg-slate-800/60 px-6 py-3 font-semibold hover:bg-slate-700/60">
                Nullstill baseline
              </button>
            )}
          </div>

          {baseline && (
            <p className="mx-auto mt-6 max-w-xl rounded-xl border border-slate-600/40 bg-slate-800/40 px-4 py-3 text-sm text-slate-200">
              Baseline lagret: <strong>{formatNOK(baseline.monthlyExpenseAvg)}/mnd</strong>
            </p>
          )}
        </div>
      </div>

      <div className="px-6 pb-20">
        <div className="mx-auto max-w-7xl">
          {mode === "baseline" && computed && (
            <section className="space-y-8">
              <div className="glass-morphism rounded-3xl p-8 shadow-2xl md:p-10">
                <h2 className="mb-8 text-3xl font-bold">Oppsummering fra fil</h2>
                <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
                  <div className="rounded-2xl border border-slate-600/50 bg-slate-700/50 p-6 text-center">
                    <div className="text-4xl font-bold">{computed.months.length}</div>
                    <div className="text-sm text-slate-300">Måneder funnet</div>
                  </div>
                  <div className="rounded-2xl border border-slate-600/50 bg-slate-700/50 p-6 text-center">
                    <div className="text-4xl font-bold">{formatNOK(computed.monthlyAvg)}</div>
                    <div className="text-sm text-slate-300">Snitt utgifter/mnd</div>
                  </div>
                  <div className="rounded-2xl border border-slate-600/50 bg-slate-700/50 p-6 text-center">
                    <div className="text-4xl font-bold">{formatNOK(computed.subsAvg)}</div>
                    <div className="text-sm text-slate-300">Abonnement/mnd</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                  <div className="rounded-2xl border border-slate-600/30 bg-slate-700/30 p-6">
                    <h3 className="mb-4 text-xl font-bold">Topp-kategorier</h3>
                    <div className="space-y-3">
                      {computed.topCats.map(([cat, val]) => (
                        <div key={cat} className="flex items-center justify-between rounded-xl bg-slate-600/30 p-3">
                          <span>{cat}</span>
                          <span className="font-bold">{formatNOK(val)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-600/30 bg-slate-700/30 p-6">
                    <h3 className="mb-4 text-xl font-bold">Mulige abonnement</h3>
                    {computed.subs.length ? (
                      <div className="space-y-3">
                        {computed.subs.slice(0, 8).map((s) => (
                          <div key={s.key} className="flex items-center justify-between rounded-xl bg-slate-600/30 p-3">
                            <span className="truncate">{s.name}</span>
                            <span className="ml-3 shrink-0 font-bold">~{formatNOK(s.avgAmount)}/mnd</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-300">Ingen tydelige abonnement funnet.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="glass-morphism rounded-3xl p-8 shadow-2xl md:p-10">
                <h2 className="mb-8 text-3xl font-bold">Sparestrategi</h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  {(["lite", "middels", "mye"] as const).map((k) => {
                    const label = k === "lite" ? "Rolig" : k === "middels" ? "Stram opp" : "Aggressiv"
                    const target = computed.targets[k]
                    const actions = planCards?.[k] ?? []
                    return (
                      <div key={k} className="decision-card rounded-2xl p-6">
                        {k === "middels" && <div className="recommended-badge">Anbefalt</div>}
                        <h3 className="mb-4 text-xl font-bold">{label}</h3>
                        <div className="mb-5 rounded-xl border border-slate-600/50 bg-slate-700/50 p-4 text-center">
                          <div className="text-3xl font-bold">{formatNOK(target)}/mnd</div>
                        </div>
                        <div className="space-y-3">
                          {actions.map((a, i) => (
                            <div key={i} className="rounded-xl border border-slate-500/30 bg-slate-600/30 p-3">
                              <div className="font-semibold">{a.title}</div>
                              <div className="text-sm text-slate-300">{a.why}</div>
                              <div className="font-bold text-blue-300">~{formatNOK(a.amount)}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="text-center">
                <button onClick={saveBaseline} className="rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-600 to-blue-700 px-10 py-5 text-lg font-bold shadow-2xl transition-transform hover:scale-105">
                  Lagre som baseline
                </button>
              </div>
            </section>
          )}

          {mode === "baseline" && !computed && (
            <section className="rounded-2xl border border-slate-700 bg-slate-800/30 p-8 text-center text-slate-300">
              Last opp en CSV med flere måneder for å lage baseline.
            </section>
          )}

          {mode === "monthly" && !baseline && (
            <section className="rounded-2xl border border-slate-700 bg-slate-800/30 p-8 text-center text-slate-300">
              Lag baseline først.
            </section>
          )}

          {mode === "monthly" && baseline && monthlyCompare && (
            <section className="space-y-8">
              <div className="glass-morphism rounded-3xl p-8 shadow-2xl md:p-10">
                <h2 className="mb-8 text-3xl font-bold">Månedlig oppfølging</h2>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                  <div className="rounded-2xl border border-slate-600/50 bg-slate-700/50 p-6 text-center">
                    <div className="text-3xl font-bold">{monthlyCompare.month}</div>
                    <div className="text-sm text-slate-300">Måned</div>
                  </div>
                  <div className="rounded-2xl border border-slate-600/50 bg-slate-700/50 p-6 text-center">
                    <div className="text-3xl font-bold">{formatNOK(monthlyCompare.thisExp)}</div>
                    <div className="text-sm text-slate-300">Utgifter</div>
                  </div>
                  <div className={`rounded-2xl border p-6 text-center ${monthlyCompare.saved >= 0 ? "border-green-700/50 bg-green-900/40" : "border-red-700/50 bg-red-900/40"}`}>
                    <div className={`text-3xl font-bold ${monthlyCompare.saved >= 0 ? "text-green-300" : "text-red-300"}`}>{formatNOK(monthlyCompare.saved)}</div>
                    <div className="text-sm text-slate-300">Spart vs baseline</div>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <button onClick={saveMonthlySnapshot} className="rounded-xl border border-blue-500/20 bg-gradient-to-r from-blue-600 to-blue-700 px-7 py-3 font-bold hover:opacity-95">
                    Lagre måned i historikk
                  </button>
                </div>
              </div>

              {history.length > 0 && (
                <div className="glass-morphism rounded-3xl p-8 shadow-2xl md:p-10">
                  <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-2xl font-bold">Historikk</h3>
                    <div className={`rounded-lg px-4 py-2 text-sm font-semibold ${yearToDate >= 0 ? "bg-green-900/40 text-green-200" : "bg-red-900/40 text-red-200"}`}>
                      Spart i år: {formatNOK(yearToDate)}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {history.map((h) => (
                      <div key={h.month} className="rounded-xl border border-slate-600/50 bg-slate-700/40 p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="font-semibold">{h.month}</span>
                          <span className={h.saved >= 0 ? "text-green-300 font-bold" : "text-red-300 font-bold"}>{formatNOK(h.saved)}</span>
                        </div>
                        <div className="mb-2 flex h-3 overflow-hidden rounded bg-slate-800">
                          <div className="bg-slate-400" style={{ width: `${(h.baseline / historyMaxExpense) * 100}%` }} />
                        </div>
                        <div className="mb-2 -mt-3 flex h-3 overflow-hidden rounded bg-transparent">
                          <div className="bg-blue-500" style={{ width: `${(h.expense / historyMaxExpense) * 100}%` }} />
                        </div>
                        <div className="text-xs text-slate-300">Grå = baseline, blå = faktisk utgift</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {mode === "monthly" && baseline && !monthlyCompare && (
            <section className="rounded-2xl border border-slate-700 bg-slate-800/30 p-8 text-center text-slate-300">
              Last opp en månedlig CSV for å sammenligne mot baseline.
            </section>
          )}
        </div>
      </div>
    </main>
  )
}
