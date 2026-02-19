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

async function verifyAndClaimDevice(code: string, secret: string) {
  const supabase = getSupabaseAdmin();

  // Preferred: RPC for atomic verify+claim that returns a cookie token
  const rpc = await supabase
    .rpc("kiosk_claim", { code, secret })
    .select()
    .maybeSingle();

  if (!rpc.error && rpc.data) {
    const token =
      (rpc.data as any).kiosk_token ??
      (rpc.data as any).token ??
      (rpc.data as any).cookie ??
      (rpc.data as any).uk_kiosk ??
      null;
    if (typeof token === "string" && token.length > 0) return token;
  }

  // Fallback: common table patterns
  const candidates = [
    { table: "kiosk_devices", codeCol: "claim_code", secretCol: "claim_secret", tokenCol: "kiosk_token", idCol: "id", claimedCol: "claimed_at" },
    { table: "devices", codeCol: "claim_code", secretCol: "claim_secret", tokenCol: "kiosk_token", idCol: "id", claimedCol: "claimed_at" },
    { table: "devices", codeCol: "code", secretCol: "secret", tokenCol: "kiosk_token", idCol: "id", claimedCol: "claimed_at" },
  ] as const;

  for (const c of candidates) {
    const sel = await supabase
      .from(c.table)
      .select(`${c.idCol},${c.tokenCol},${c.claimedCol}`)
      .eq(c.codeCol as any, code)
      .eq(c.secretCol as any, secret)
      .maybeSingle();

    if (sel.error || !sel.data) continue;

    const token =
      (sel.data as any)[c.tokenCol] ??
      (sel.data as any).token ??
      (sel.data as any).cookie ??
      null;

    if (typeof token === "string" && token.length > 0) {
      // mark claimed (best-effort)
      const patch: Record<string, any> = {};
      patch[c.claimedCol] = new Date().toISOString();
      await supabase.from(c.table).update(patch).eq(c.idCol as any, (sel.data as any)[c.idCol]);
      return token;
    }

    // If no token column exists, fall back to device id as cookie value (minimal, but valid)
    const id = (sel.data as any)[c.idCol];
    if (typeof id === "string" && id.length > 0) {
      const patch: Record<string, any> = {};
      patch[c.claimedCol] = new Date().toISOString();
      await supabase.from(c.table).update(patch).eq(c.idCol as any, id);
      return id;
    }
  }

  return null;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code")?.trim() || "";
  const secret = url.searchParams.get("secret")?.trim() || "";

  if (!code || !secret) {
    return NextResponse.json({ error: "Missing code/secret" }, { status: 400 });
  }

  let token: string | null = null;
  try {
    token = await verifyAndClaimDevice(code, secret);
  } catch {
    return NextResponse.json({ error: "Claim failed" }, { status: 500 });
  }

  if (!token) {
    return NextResponse.json({ error: "Invalid device" }, { status: 401 });
  }

  const res = NextResponse.redirect(new URL("/kids", "https://www.ukepenger.no"), {
    status: 303,
  });

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
