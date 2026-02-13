"use client";

import { getDeviceSessionFromDocument } from "@/lib/device-session";
import { supabase } from "@/lib/supabaseClient";

export type ApprovalMode = "REQUIRE_APPROVAL" | "AUTO_APPROVE";

type EnsureFamilyResult = {
  familyId: string | null;
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
    return { user: null, familyId: null, deviceId: null, source: null as const, error: admin.error ?? "Ingen familie." };
  }

  const res = await supabase
    .from("devices")
    .select("id, family_id, revoked_at, token_hash")
    .eq("id", deviceSession.deviceId)
    .maybeSingle();

  if (res.error || !res.data) {
    return { user: null, familyId: null, deviceId: null, source: null as const, error: "Enheten er ikke gyldig." };
  }

  if (res.data.revoked_at) {
    return { user: null, familyId: null, deviceId: null, source: null as const, error: "Enheten er deaktivert." };
  }

  if (res.data.token_hash !== deviceSession.tokenHash) {
    return { user: null, familyId: null, deviceId: null, source: null as const, error: "Enheten er ikke gyldig." };
  }

  const familyId = (res.data.family_id as string | undefined) ?? null;
  if (!familyId) {
    return { user: null, familyId: null, deviceId: null, source: null as const, error: "Familie ikke funnet." };
  }

  return { user: null, familyId, deviceId: res.data.id as string, source: "device" as const, error: null };
}
