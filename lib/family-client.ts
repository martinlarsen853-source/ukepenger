"use client";

import { getDeviceSessionFromDocument } from "@/lib/device-session";
import { supabase } from "@/lib/supabaseClient";

export type ApprovalMode = "REQUIRE_APPROVAL" | "AUTO_APPROVE";

type EnsureFamilyResult = {
  familyId: string | null;
  error: string | null;
};

export type SetupStatus = {
  familyId: string | null;
  hasChildren: boolean;
  hasTasks: boolean;
  needsOnboarding: boolean;
  error: string | null;
};

export async function getCurrentSessionUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    return { user: null, error: error.message };
  }
  return { user: data.user, error: null };
}

export async function getFamilyIdForUser(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("family_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return { familyId: null, error: error.message };
  return { familyId: (data?.family_id as string | undefined) ?? null, error: null };
}

export async function ensureFamilyForUser(user: { id: string; email?: string | null }): Promise<EnsureFamilyResult> {
  const existing = await getFamilyIdForUser(user.id);
  if (existing.familyId) return { familyId: existing.familyId, error: null };

  const familyNameSeed = user.email?.split("@")[0]?.trim();
  const familyName = familyNameSeed ? `${familyNameSeed} sin familie` : "Min familie";

  const familyInsert = await supabase
    .from("families")
    .insert({ name: familyName })
    .select("id")
    .single();

  if (familyInsert.error || !familyInsert.data) {
    return { familyId: null, error: familyInsert.error?.message ?? "Kunne ikke opprette familie." };
  }

  const familyId = familyInsert.data.id as string;

  const profileInsert = await supabase.from("profiles").insert({
    user_id: user.id,
    family_id: familyId,
    role: "ADMIN",
  });

  if (profileInsert.error) {
    const retry = await getFamilyIdForUser(user.id);
    if (retry.familyId) return { familyId: retry.familyId, error: null };
    return { familyId: null, error: profileInsert.error.message };
  }

  return { familyId, error: null };
}

export async function getAdminSetupStatus(): Promise<SetupStatus> {
  const { user, error: userError } = await getCurrentSessionUser();
  if (userError || !user) {
    return {
      familyId: null,
      hasChildren: false,
      hasTasks: false,
      needsOnboarding: false,
      error: userError ?? "Ikke innlogget.",
    };
  }

  const profile = await getFamilyIdForUser(user.id);
  if (profile.error) {
    return {
      familyId: null,
      hasChildren: false,
      hasTasks: false,
      needsOnboarding: true,
      error: profile.error,
    };
  }

  if (!profile.familyId) {
    return {
      familyId: null,
      hasChildren: false,
      hasTasks: false,
      needsOnboarding: true,
      error: null,
    };
  }

  const [childrenRes, tasksRes] = await Promise.all([
    supabase.from("children").select("id", { head: true, count: "exact" }).eq("family_id", profile.familyId),
    supabase.from("tasks").select("id", { head: true, count: "exact" }).eq("family_id", profile.familyId),
  ]);

  if (childrenRes.error || tasksRes.error) {
    return {
      familyId: profile.familyId,
      hasChildren: false,
      hasTasks: false,
      needsOnboarding: true,
      error: childrenRes.error?.message ?? tasksRes.error?.message ?? "Kunne ikke lese setup-status.",
    };
  }

  const hasChildren = (childrenRes.count ?? 0) > 0;
  const hasTasks = (tasksRes.count ?? 0) > 0;

  return {
    familyId: profile.familyId,
    hasChildren,
    hasTasks,
    needsOnboarding: !hasChildren || !hasTasks,
    error: null,
  };
}

export async function getCurrentAdminContext() {
  const { user, error: userError } = await getCurrentSessionUser();
  if (userError || !user) {
    return { user: null, familyId: null, error: userError ?? "Ikke innlogget." };
  }

  const profile = await getFamilyIdForUser(user.id);
  if (profile.error || !profile.familyId) {
    return { user, familyId: null, error: profile.error ?? "Fant ingen familie for bruker." };
  }

  return { user, familyId: profile.familyId, error: null };
}

export async function getCurrentFamilyContext() {
  const admin = await getCurrentAdminContext();
  if (admin.familyId) {
    return { user: admin.user, familyId: admin.familyId, deviceId: null, source: "admin" as const, error: null };
  }

  const deviceSession = getDeviceSessionFromDocument();
  if (!deviceSession) {
    return { user: null, familyId: null, deviceId: null, source: null, error: admin.error ?? "Ingen familie." };
  }

  const res = await supabase
    .from("devices")
    .select("id, family_id, revoked_at, token_hash")
    .eq("id", deviceSession.deviceId)
    .maybeSingle();

  if (res.error || !res.data) {
    return { user: null, familyId: null, deviceId: null, source: null, error: "Enheten er ikke gyldig." };
  }

  if (res.data.revoked_at) {
    return { user: null, familyId: null, deviceId: null, source: null, error: "Enheten er deaktivert." };
  }

  if (res.data.token_hash !== deviceSession.tokenHash) {
    return { user: null, familyId: null, deviceId: null, source: null, error: "Enheten er ikke gyldig." };
  }

  const familyId = (res.data.family_id as string | undefined) ?? null;
  if (!familyId) {
    return { user: null, familyId: null, deviceId: null, source: null, error: "Familie ikke funnet." };
  }

  return { user: null, familyId, deviceId: res.data.id as string, source: "device" as const, error: null };
}
