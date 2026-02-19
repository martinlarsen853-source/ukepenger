import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

  if (!url || !key) throw new Error("Supabase env missing");
  return createClient(url, key, { auth: { persistSession: false } });
}

async function verifyAndClaimDevice(code: string, secret: string): Promise<string | null> {
  const supabase = getSupabaseAdmin();

  // Prefer atomic RPC if it exists; keep types fully "any" to avoid TS deep instantiation.
  const rpc: any = await (supabase as any).rpc("kiosk_claim", { code, secret });
  if (rpc && !rpc.error && rpc.data) {
    const d = Array.isArray(rpc.data) ? rpc.data[0] : rpc.data;
    const token =
      d?.kiosk_token ?? d?.token ?? d?.cookie ?? d?.uk_kiosk ?? null;
    if (typeof token === "string" && token.length > 0) return token;
  }

  // Fallback to direct table lookup/update with any-typed client to avoid TS recursion.
  const candidates: Array<{
    table: string;
    codeCol: string;
    secretCol: string;
    tokenCol: string;
    idCol: string;
    claimedCol: string;
  }> = [
    {
      table: "kiosk_devices",
      codeCol: "claim_code",
      secretCol: "claim_secret",
      tokenCol: "kiosk_token",
      idCol: "id",
      claimedCol: "claimed_at",
    },
    {
      table: "devices",
      codeCol: "claim_code",
      secretCol: "claim_secret",
      tokenCol: "kiosk_token",
      idCol: "id",
      claimedCol: "claimed_at",
    },
    {
      table: "devices",
      codeCol: "code",
      secretCol: "secret",
      tokenCol: "kiosk_token",
      idCol: "id",
      claimedCol: "claimed_at",
    },
  ];

  const sb: any = supabase;

  for (const c of candidates) {
    const sel: any = await sb
      .from(c.table)
      .select(`${c.idCol},${c.tokenCol},${c.claimedCol}`)
      .eq(c.codeCol, code)
      .eq(c.secretCol, secret)
      .maybeSingle();

    if (sel?.error || !sel?.data) continue;

    const token =
      sel.data?.[c.tokenCol] ?? sel.data?.token ?? sel.data?.cookie ?? null;

    const id = sel.data?.[c.idCol];

    // best-effort claim mark
    const patch: any = {};
    patch[c.claimedCol] = new Date().toISOString();
    if (id) await sb.from(c.table).update(patch).eq(c.idCol, id);

    if (typeof token === "string" && token.length > 0) return token;
    if (typeof id === "string" && id.length > 0) return id;
  }

  return null;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = (url.searchParams.get("code") || "").trim();
  const secret = (url.searchParams.get("secret") || "").trim();

  if (!code || !secret) {
    return NextResponse.json({ error: "Missing code/secret" }, { status: 400 });
  }

  const token = await verifyAndClaimDevice(code, secret);
  if (!token) {
    return NextResponse.json({ error: "Invalid device" }, { status: 401 });
  }

  const res = NextResponse.redirect("https://www.ukepenger.no/kids", { status: 303 });

  res.cookies.set({
    name: "uk_kiosk",
    value: token,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return res;
}
