import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getServiceSupabaseClient } from "@/lib/server-supabase";

type AdminProfile = {
  family_id: string;
  role: string;
};

type ChildRow = {
  id: string;
  family_id: string;
};

function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return { url, anonKey };
}

function parseAuthToken(req: Request) {
  const header = req.headers.get("authorization") ?? "";
  if (!header.toLowerCase().startsWith("bearer ")) return null;
  return header.slice(7).trim();
}

export async function POST(request: Request) {
  const { url, anonKey } = getSupabaseEnv();
  if (!url || !anonKey) {
    return NextResponse.json({ error: "Supabase env mangler." }, { status: 500 });
  }

  const token = parseAuthToken(request);
  if (!token) {
    return NextResponse.json({ error: "Mangler auth-token." }, { status: 401 });
  }

  const authClient = createClient(url, anonKey);
  const serviceClient = getServiceSupabaseClient();
  if (!serviceClient) {
    return NextResponse.json({ error: "Server mangler service role key." }, { status: 500 });
  }

  const authUserRes = await authClient.auth.getUser(token);
  if (authUserRes.error || !authUserRes.data.user) {
    return NextResponse.json({ error: authUserRes.error?.message ?? "Ugyldig innlogging." }, { status: 401 });
  }

  const profileRes = await serviceClient
    .from("profiles")
    .select("family_id, role")
    .eq("user_id", authUserRes.data.user.id)
    .maybeSingle();

  if (profileRes.error || !profileRes.data) {
    return NextResponse.json({ error: profileRes.error?.message ?? "Fant ikke admin-profil." }, { status: 403 });
  }

  const profile = profileRes.data as AdminProfile;
  if (!profile.family_id || profile.role !== "ADMIN") {
    return NextResponse.json({ error: "Ingen admin-tilgang." }, { status: 403 });
  }

  let body: { childId?: string; title?: string; targetOre?: number; note?: string } = {};
  try {
    body = (await request.json()) as { childId?: string; title?: string; targetOre?: number; note?: string };
  } catch {
    return NextResponse.json({ error: "Ugyldig JSON." }, { status: 400 });
  }

  const childId = body.childId?.trim() ?? "";
  const title = body.title?.trim() ?? "";
  const targetOre = Number(body.targetOre);
  const note = body.note?.trim() ? body.note.trim() : null;

  if (!childId || !title) {
    return NextResponse.json({ error: "Mangler childId eller title." }, { status: 400 });
  }
  if (!Number.isInteger(targetOre) || targetOre <= 0) {
    return NextResponse.json({ error: "targetOre ma vaere et positivt heltall." }, { status: 400 });
  }

  const childRes = await serviceClient
    .from("children")
    .select("id, family_id")
    .eq("id", childId)
    .maybeSingle();
  if (childRes.error || !childRes.data) {
    return NextResponse.json({ error: childRes.error?.message ?? "Barn ikke funnet." }, { status: 404 });
  }

  const child = childRes.data as ChildRow;
  if (child.family_id !== profile.family_id) {
    return NextResponse.json({ error: "Barnet tilhorer ikke din familie." }, { status: 403 });
  }

  const insertRes = await serviceClient
    .from("wishlist_items")
    .insert({
      family_id: profile.family_id,
      child_id: childId,
      title,
      target_ore: targetOre,
      note,
      active: true,
    })
    .select("id, child_id, title, target_ore, note, active, created_at")
    .single();

  if (insertRes.error || !insertRes.data) {
    return NextResponse.json({ error: insertRes.error?.message ?? "Kunne ikke lagre onskeliste-item." }, { status: 400 });
  }

  return NextResponse.json({ ok: true, item: insertRes.data });
}

