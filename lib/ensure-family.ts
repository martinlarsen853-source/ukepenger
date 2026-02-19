import type { SupabaseClient } from "@supabase/supabase-js";

type ProfileRow = {
  family_id: string | null;
};

type FamilyRow = {
  id: string;
};

export async function ensureFamilyForUser(supabase: SupabaseClient, userId: string) {
  const profileRes = await supabase
    .from("profiles")
    .select("family_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (profileRes.error) {
    throw new Error(profileRes.error.message);
  }

  const profile = (profileRes.data as ProfileRow | null) ?? null;
  if (!profile) {
    throw new Error("Fant ikke admin-profil.");
  }

  if (profile.family_id) {
    return profile.family_id;
  }

  const familyInsert = await supabase.from("families").insert({}).select("id").single();
  if (familyInsert.error || !familyInsert.data) {
    throw new Error(familyInsert.error?.message ?? "Kunne ikke opprette familie.");
  }

  const newFamilyId = (familyInsert.data as FamilyRow).id;

  const profileUpdate = await supabase
    .from("profiles")
    .update({ family_id: newFamilyId })
    .eq("user_id", userId)
    .is("family_id", null);

  if (profileUpdate.error) {
    throw new Error(profileUpdate.error.message);
  }

  const verifyProfile = await supabase
    .from("profiles")
    .select("family_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (verifyProfile.error) {
    throw new Error(verifyProfile.error.message);
  }

  const verifiedFamilyId = (verifyProfile.data as ProfileRow | null)?.family_id ?? null;
  if (!verifiedFamilyId) {
    throw new Error("Fant ikke familie etter opprettelse.");
  }

  return verifiedFamilyId;
}
