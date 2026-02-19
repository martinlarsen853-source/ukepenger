import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { generateDeviceCode, generateDeviceSecret, hashToken } from "@/lib/device-session";

type AuthContext = {
  supabase: SupabaseClient;
  userId: string;
};

type ProfileRow = {
  family_id: string | null;
};

type ChildRow = {
  id: string;
  family_id: string;
};

type ChildQrRow = {
  id: string;
  child_id: string;
  code: string;
  secret_hash: string;
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

async function generateUniqueChildQrCode(supabase: SupabaseClient) {
  for (let i = 0; i < 10; i += 1) {
    const candidate = await generateDeviceCode(8);
    const existsRes = await supabase.from("child_qr_codes").select("id").eq("code", candidate).maybeSingle();
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

  const profileRes = await authContext.supabase
    .from("profiles")
    .select("family_id")
    .eq("user_id", authContext.userId)
    .maybeSingle();

  if (profileRes.error || !profileRes.data) {
    return NextResponse.json({ error: profileRes.error?.message ?? "Fant ikke admin-profil." }, { status: 403 });
  }

  const familyId = (profileRes.data as ProfileRow).family_id;
  if (!familyId) {
    return NextResponse.json({ error: "Fant ikke familie." }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as { childId?: string; regenerate?: boolean };
  const childId = body.childId?.trim() ?? "";
  const regenerate = Boolean(body.regenerate);

  if (!childId) {
    return NextResponse.json({ error: "Mangler childId." }, { status: 400 });
  }

  const childRes = await authContext.supabase
    .from("children")
    .select("id, family_id")
    .eq("id", childId)
    .maybeSingle();

  if (childRes.error || !childRes.data) {
    return NextResponse.json({ error: childRes.error?.message ?? "Barn ikke funnet." }, { status: 404 });
  }

  const child = childRes.data as ChildRow;
  if (child.family_id !== familyId) {
    return NextResponse.json({ error: "Ingen tilgang til barnet." }, { status: 403 });
  }

  const existingRes = await authContext.supabase
    .from("child_qr_codes")
    .select("id, child_id, code, secret_hash, active, revoked_at")
    .eq("child_id", childId)
    .eq("active", true)
    .is("revoked_at", null)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingRes.error) {
    return NextResponse.json({ error: existingRes.error.message }, { status: 400 });
  }

  const existing = (existingRes.data as ChildQrRow | null) ?? null;
  if (existing && !regenerate) {
    return NextResponse.json(
      { error: "Aktiv barn-QR finnes allerede. Bruk regenerate for ny kode." },
      { status: 409 }
    );
  }

  const createNewQr = Boolean(existing);
  const code = await generateUniqueChildQrCode(authContext.supabase);
  if (!code) {
    return NextResponse.json({ error: "Klarte ikke generere unik kode." }, { status: 500 });
  }

  const secret = await generateDeviceSecret(48);
  const secretHash = await hashToken(secret);
  const now = new Date().toISOString();

  if (existing && createNewQr) {
    const revokeRes = await authContext.supabase
      .from("child_qr_codes")
      .update({
        active: false,
        revoked_at: now,
        updated_at: now,
      })
      .eq("id", existing.id);

    if (revokeRes.error) {
      return NextResponse.json({ error: revokeRes.error.message }, { status: 400 });
    }

    const insertRes = await authContext.supabase.from("child_qr_codes").insert({
      child_id: childId,
      code,
      secret_hash: secretHash,
      active: true,
      revoked_at: null,
      updated_at: now,
    });

    if (insertRes.error) {
      return NextResponse.json({ error: insertRes.error.message }, { status: 400 });
    }
  } else if (!existing) {
    const insertRes = await authContext.supabase.from("child_qr_codes").insert({
      child_id: childId,
      code,
      secret_hash: secretHash,
      active: true,
      revoked_at: null,
      updated_at: now,
    });

    if (insertRes.error) {
      return NextResponse.json({ error: insertRes.error.message }, { status: 400 });
    }
  }

  const claimUrl = `https://www.ukepenger.no/kiosk/child/claim?code=${encodeURIComponent(code)}&secret=${encodeURIComponent(secret)}`;
  return NextResponse.json({
    ok: true,
    claimUrl,
    code,
    regenerated: regenerate,
  });
}
