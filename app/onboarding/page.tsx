"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AVATAR_OPTIONS, DEFAULT_AVATAR_KEY, getAvatarByKey } from "@/lib/avatars";
import { ensureFamilyForUser, getAdminSetupStatus, getCurrentSessionUser, type ApprovalMode } from "@/lib/family-client";
import { supabase } from "@/lib/supabaseClient";

type TaskTemplate = {
  key: string;
  title: string;
  amountOre: number;
  enabled: boolean;
};

type ChildDraft = {
  name: string;
  avatarKey: string;
};

const defaultTasks: TaskTemplate[] = [
  { key: "rydde", title: "Rydde rommet", amountOre: 2500, enabled: true },
  { key: "oppvask", title: "Ta oppvask", amountOre: 2000, enabled: true },
  { key: "soppel", title: "Ta ut soppel", amountOre: 1500, enabled: true },
  { key: "lekser", title: "Lekser uten mas", amountOre: 3000, enabled: false },
  { key: "hund", title: "Lufte hund", amountOre: 2500, enabled: false },
];

function formatKr(ore: number) {
  return `${(ore / 100).toFixed(2)} kr`;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  const [step, setStep] = useState(1);
  const [familyName, setFamilyName] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [childName, setChildName] = useState("");
  const [childAvatar, setChildAvatar] = useState(DEFAULT_AVATAR_KEY);
  const [childrenDrafts, setChildrenDrafts] = useState<ChildDraft[]>([]);

  const [taskTemplates, setTaskTemplates] = useState<TaskTemplate[]>(defaultTasks);
  const [approvalMode, setApprovalMode] = useState<ApprovalMode>("REQUIRE_APPROVAL");

  const [hasChildrenAlready, setHasChildrenAlready] = useState(false);
  const [hasTasksAlready, setHasTasksAlready] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const run = async () => {
      const session = await getCurrentSessionUser();
      if (!session.user) {
        router.replace("/login");
        return;
      }

      const ensured = await ensureFamilyForUser({ id: session.user.id, email: session.user.email });
      if (ensured.error) {
        setStatus(`Feil: ${ensured.error}`);
        setLoading(false);
        return;
      }

      const setup = await getAdminSetupStatus();
      if (setup.error) {
        setStatus(`Feil: ${setup.error}`);
        setLoading(false);
        return;
      }

      if (!setup.needsOnboarding && setup.familyId) {
        router.replace("/admin/inbox");
        return;
      }

      setFamilyId(setup.familyId);
      setHasChildrenAlready(setup.hasChildren);
      setHasTasksAlready(setup.hasTasks);

      if (setup.familyId) {
        const familyRes = await supabase.from("families").select("name, approval_mode").eq("id", setup.familyId).maybeSingle();
        if (!familyRes.error && familyRes.data) {
          setFamilyName((familyRes.data.name as string | undefined) ?? "");
          setApprovalMode((familyRes.data.approval_mode as ApprovalMode | undefined) ?? "REQUIRE_APPROVAL");
        }
      }

      setLoading(false);
    };

    void run();
  }, [router]);

  const selectedTaskCount = useMemo(() => taskTemplates.filter((task) => task.enabled).length, [taskTemplates]);

  const canContinueStep1 = acceptedTerms;
  const canContinueStep2 = hasChildrenAlready || childrenDrafts.length > 0;
  const canContinueStep3 = hasTasksAlready || selectedTaskCount > 0;

  const addChildDraft = () => {
    const trimmed = childName.trim();
    if (!trimmed) return;
    setChildrenDrafts((prev) => [...prev, { name: trimmed, avatarKey: childAvatar }]);
    setChildName("");
    setChildAvatar(DEFAULT_AVATAR_KEY);
  };

  const removeChildDraft = (index: number) => {
    setChildrenDrafts((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleTask = (key: string) => {
    setTaskTemplates((prev) => prev.map((task) => (task.key === key ? { ...task, enabled: !task.enabled } : task)));
  };

  const updateTaskAmount = (key: string, amountNok: string) => {
    const parsed = Number(amountNok.replace(",", "."));
    const amountOre = Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed * 100) : 0;
    setTaskTemplates((prev) => prev.map((task) => (task.key === key ? { ...task, amountOre } : task)));
  };

  const finish = async () => {
    if (!familyId) {
      setStatus("Feil: Mangler familyId.");
      return;
    }

    setSaving(true);
    setStatus("");

    if (familyName.trim()) {
      const familyUpdate = await supabase.from("families").update({ name: familyName.trim() }).eq("id", familyId);
      if (familyUpdate.error) {
        setSaving(false);
        setStatus(`Feil: ${familyUpdate.error.message}`);
        return;
      }
    }

    if (!hasChildrenAlready && childrenDrafts.length > 0) {
      const childRows = childrenDrafts.map((child) => ({
        family_id: familyId,
        name: child.name,
        avatar_key: child.avatarKey,
        active: true,
      }));
      const childInsert = await supabase.from("children").insert(childRows);
      if (childInsert.error) {
        setSaving(false);
        setStatus(`Feil: ${childInsert.error.message}`);
        return;
      }
    }

    if (!hasTasksAlready) {
      const taskRows = taskTemplates
        .filter((task) => task.enabled)
        .map((task) => ({
          family_id: familyId,
          title: task.title,
          amount_ore: task.amountOre,
          active: true,
        }));

      if (taskRows.length > 0) {
        const taskInsert = await supabase.from("tasks").insert(taskRows);
        if (taskInsert.error) {
          setSaving(false);
          setStatus(`Feil: ${taskInsert.error.message}`);
          return;
        }
      }
    }

    const settingsUpdate = await supabase.from("families").update({ approval_mode: approvalMode }).eq("id", familyId);
    if (settingsUpdate.error) {
      setSaving(false);
      setStatus(`Feil: ${settingsUpdate.error.message}`);
      return;
    }

    setSaving(false);
    router.replace("/admin/inbox");
  };

  if (loading) {
    return <main className="min-h-screen bg-slate-950 p-6 text-slate-100">Laster onboarding...</main>;
  }

  const isError = status.startsWith("Feil:");

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 md:px-8">
      <section className="mx-auto max-w-3xl space-y-5">
        <header className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h1 className="text-2xl font-semibold tracking-tight">Setup wizard</h1>
          <p className="mt-2 text-sm text-slate-300">Steg {step} av 4. Sett opp familie, barn og oppgaver.</p>
        </header>

        {step === 1 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold">Steg 1: Familie</h2>
            <label className="mt-4 block space-y-1.5 text-sm">
              <span className="text-slate-300">Familienavn (valgfritt)</span>
              <input
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="For eksempel: Hansen"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5"
              />
            </label>
            <label className="mt-4 flex items-start gap-3 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4"
              />
              <span>Jeg godtar en enkel bruksvilkar-light for test av tjenesten.</span>
            </label>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!canContinueStep1}
                className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 disabled:opacity-50"
              >
                Neste
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold">Steg 2: Legg til barn</h2>
            {hasChildrenAlready && (
              <p className="mt-2 rounded-lg border border-emerald-800 bg-emerald-950/30 px-3 py-2 text-sm text-emerald-200">
                Familien har allerede barn registrert. Du kan likevel legge til flere.
              </p>
            )}
            <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
              <input
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder="Barnets navn"
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5"
              />
              <button
                type="button"
                onClick={addChildDraft}
                className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold hover:border-slate-500"
              >
                Legg til barn
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {AVATAR_OPTIONS.map((avatar) => (
                <button
                  key={avatar.key}
                  type="button"
                  onClick={() => setChildAvatar(avatar.key)}
                  className={`rounded-lg border px-3 py-2 text-lg ${
                    childAvatar === avatar.key ? "border-emerald-400 bg-emerald-900/30" : "border-slate-700 bg-slate-950"
                  }`}
                  title={avatar.label}
                >
                  {avatar.emoji}
                </button>
              ))}
            </div>

            <div className="mt-5 space-y-2">
              {childrenDrafts.map((child, index) => (
                <div key={`${child.name}-${index}`} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 px-3 py-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-lg">{getAvatarByKey(child.avatarKey).emoji}</span>
                    <span>{child.name}</span>
                  </div>
                  <button type="button" onClick={() => removeChildDraft(index)} className="text-xs text-red-300 hover:text-red-200">
                    Fjern
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-5 flex justify-between">
              <button type="button" onClick={() => setStep(1)} className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold">
                Tilbake
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={!canContinueStep2}
                className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 disabled:opacity-50"
              >
                Neste
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold">Steg 3: Standard-oppgaver</h2>
            {hasTasksAlready && (
              <p className="mt-2 rounded-lg border border-emerald-800 bg-emerald-950/30 px-3 py-2 text-sm text-emerald-200">
                Familien har allerede oppgaver. Du kan hoppe videre eller legge til flere.
              </p>
            )}
            <div className="mt-4 space-y-3">
              {taskTemplates.map((task) => (
                <div key={task.key} className="grid items-center gap-3 rounded-lg border border-slate-800 bg-slate-950 p-3 md:grid-cols-[auto_1fr_120px]">
                  <input type="checkbox" checked={task.enabled} onChange={() => toggleTask(task.key)} className="h-4 w-4" />
                  <div className="text-sm">{task.title}</div>
                  <input
                    type="text"
                    defaultValue={(task.amountOre / 100).toString()}
                    onChange={(e) => updateTaskAmount(task.key, e.target.value)}
                    className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm"
                  />
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm text-slate-400">Valgt: {selectedTaskCount} oppgaver.</p>

            <div className="mt-5 flex justify-between">
              <button type="button" onClick={() => setStep(2)} className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold">
                Tilbake
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                disabled={!canContinueStep3}
                className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 disabled:opacity-50"
              >
                Neste
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold">Steg 4: Godkjenning</h2>
            <div className="mt-4 space-y-3">
              <label className="flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-950 px-3 py-3 text-sm">
                <input
                  type="radio"
                  name="approvalMode"
                  checked={approvalMode === "REQUIRE_APPROVAL"}
                  onChange={() => setApprovalMode("REQUIRE_APPROVAL")}
                />
                <span>
                  Krev godkjenning
                  <span className="block text-slate-400">Barn sender krav, forelder godkjenner manuelt.</span>
                </span>
              </label>
              <label className="flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-950 px-3 py-3 text-sm">
                <input
                  type="radio"
                  name="approvalMode"
                  checked={approvalMode === "AUTO_APPROVE"}
                  onChange={() => setApprovalMode("AUTO_APPROVE")}
                />
                <span>
                  Auto-godkjenn
                  <span className="block text-slate-400">Krav godkjennes automatisk.</span>
                </span>
              </label>
            </div>

            <div className="mt-5 rounded-lg border border-slate-800 bg-slate-950 p-3 text-sm text-slate-300">
              Oppsummering: {childrenDrafts.length} nye barn, {selectedTaskCount} nye oppgaver, modus {approvalMode}.
            </div>

            <div className="mt-5 flex justify-between">
              <button type="button" onClick={() => setStep(3)} className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold">
                Tilbake
              </button>
              <button
                type="button"
                onClick={() => void finish()}
                disabled={saving}
                className="rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50"
              >
                {saving ? "Lagrer..." : "Fullfor setup"}
              </button>
            </div>
          </div>
        )}

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
      </section>
    </main>
  );
}
