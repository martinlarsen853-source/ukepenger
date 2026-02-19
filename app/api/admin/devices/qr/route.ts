import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { generateDeviceCode, generateDeviceSecret, hashToken } from "@/lib/device-session";
import { getServiceSupabaseClient } from "@/lib/server-supabase";

type ProfileRow = {
  family_id: string | null;
};

type DeviceRow = {
  id: string;
  family_id: string;
  device_code: string | null;
  device_secret: string | null;
  active: boolean;
  revoked_at: string | null;
};

async function getFamilyIdForAdminToken(token: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  const authClient = createClient(url, anonKey);
  const userRes = await authClient.auth.getUser(token);
  if (userRes.error || !userRes.data.user) return null;

  const service = getServiceSupabaseClient();
  if (!service) return null;

  const profileRes = await service
    .from("profiles")
    .select("family_id")
    .eq("user_id", userRes.data.user.id)
    .maybeSingle();

  if (profileRes.error || !profileRes.data) return null;
  return (profileRes.data as ProfileRow).family_id;
}

async function generateUniqueCode() {
  const service = getServiceSupabaseClient();
  if (!service) return null;

  for (let i = 0; i < 10; i += 1) {
    const candidate = await generateDeviceCode(8);
    const existsRes = await service.from("devices").select("id").eq("device_code", candidate).maybeSingle();
    if (!existsRes.data) return candidate;
  }
  return null;
}

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization") ?? "";
  const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!bearerToken) {
    return NextResponse.json({ error: "Mangler auth token." }, { status: 401 });
  }

  const familyId = await getFamilyIdForAdminToken(bearerToken);
  if (!familyId) {
    return NextResponse.json({ error: "Fant ikke familie." }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as { regenerate?: boolean };
  const regenerate = Boolean(body.regenerate);

  const service = getServiceSupabaseClient();
  if (!service) {
    return NextResponse.json({ error: "Server mangler service role key." }, { status: 500 });
  }

  const existingRes = await service
    .from("devices")
    .select("id, family_id, device_code, device_secret, active, revoked_at")
    .eq("family_id", familyId)
    .eq("active", true)
    .is("revoked_at", null)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingRes.error) {
    return NextResponse.json({ error: existingRes.error.message }, { status: 400 });
  }

  const existing = (existingRes.data as DeviceRow | null) ?? null;
  const code = existing?.device_code ?? (await generateUniqueCode());
  if (!code) {
    return NextResponse.json({ error: "Klarte ikke generere unik kode." }, { status: 500 });
  }

  const secret = existing && !regenerate && existing.device_secret ? existing.device_secret : await generateDeviceSecret(48);
  const tokenHash = await hashToken(secret);
  const now = new Date().toISOString();

  if (existing) {
    const updateRes = await service
      .from("devices")
      .update({
        device_code: code,
        device_secret: secret,
        token_hash: tokenHash,
        active: true,
        revoked_at: null,
        updated_at: now,
      })
      .eq("id", existing.id);

    if (updateRes.error) {
      return NextResponse.json({ error: updateRes.error.message }, { status: 400 });
    }
  } else {
    const insertRes = await service.from("devices").insert({
      family_id: familyId,
      name: "Kiosk",
      token_hash: tokenHash,
      device_code: code,
      device_secret: secret,
      active: true,
      updated_at: now,
    });

    if (insertRes.error) {
      return NextResponse.json({ error: insertRes.error.message }, { status: 400 });
    }
  }

  const origin = new URL(request.url).origin;
  const claimUrl = `${origin}/kiosk/claim?code=${encodeURIComponent(code)}&secret=${encodeURIComponent(secret)}`;

  return NextResponse.json({
    ok: true,
    claimUrl,
    code,
    regenerated: regenerate,
  });
}
