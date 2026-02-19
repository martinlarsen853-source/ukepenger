import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { generateDeviceCode, generateDeviceSecret, hashToken } from "@/lib/device-session";
import { ensureFamilyForUser } from "@/lib/ensure-family";

type AuthContext = {
  supabase: SupabaseClient;
  userId: string;
};

type DeviceRow = {
  id: string;
  family_id: string;
  device_code: string | null;
  device_secret: string | null;
  active: boolean;
  revoked_at: string | null;
};

async function getAuthContextForToken(token: string): Promise<AuthContext | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  const supabase = createClient(url, anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const userRes = await supabase.auth.getUser(token);
  if (userRes.error || !userRes.data.user) return null;

  return { supabase, userId: userRes.data.user.id };
}

async function generateUniqueCode(supabase: SupabaseClient) {
  for (let i = 0; i < 10; i += 1) {
    const candidate = await generateDeviceCode(8);
    const existsRes = await supabase.from("devices").select("id").eq("device_code", candidate).maybeSingle();
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

  const authContext = await getAuthContextForToken(bearerToken);
  if (!authContext) {
    return NextResponse.json({ error: "Ugyldig innlogging." }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { regenerate?: boolean };
  const regenerate = Boolean(body.regenerate);

  let familyId: string;
  try {
    familyId = await ensureFamilyForUser(authContext.supabase, authContext.userId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Kunne ikke klargjore familie.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const existingRes = await authContext.supabase
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
  const createNewDevice = Boolean(existing && regenerate);
  const code = createNewDevice ? await generateUniqueCode(authContext.supabase) : existing?.device_code ?? (await generateUniqueCode(authContext.supabase));
  if (!code) {
    return NextResponse.json({ error: "Klarte ikke generere unik kode." }, { status: 500 });
  }

  const secret = existing && !createNewDevice && existing.device_secret ? existing.device_secret : await generateDeviceSecret(48);
  const tokenHash = await hashToken(secret);
  const now = new Date().toISOString();

  if (existing && createNewDevice) {
    const revokeRes = await authContext.supabase
      .from("devices")
      .update({
        active: false,
        revoked_at: now,
        updated_at: now,
      })
      .eq("id", existing.id);

    if (revokeRes.error) {
      return NextResponse.json({ error: revokeRes.error.message }, { status: 400 });
    }

    const insertRes = await authContext.supabase.from("devices").insert({
      family_id: familyId,
      name: "Kiosk",
      token_hash: tokenHash,
      device_code: code,
      device_secret: secret,
      active: true,
      revoked_at: null,
      updated_at: now,
    });

    if (insertRes.error) {
      return NextResponse.json({ error: insertRes.error.message }, { status: 400 });
    }
  } else if (existing) {
    const updateRes = await authContext.supabase
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
    const insertRes = await authContext.supabase.from("devices").insert({
      family_id: familyId,
      name: "Kiosk",
      token_hash: tokenHash,
      device_code: code,
      device_secret: secret,
      active: true,
      revoked_at: null,
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

