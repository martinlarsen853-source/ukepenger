import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function env(key: string) {
  const v = process.env[key];
  return typeof v === "string" && v.length > 0 ? v : null;
}

function supabaseAdmin() {
  const url = env("SUPABASE_URL") || env("NEXT_PUBLIC_SUPABASE_URL");

  const key =
    env("SUPABASE_SERVICE_ROLE_KEY") ||
    env("SUPABASE_SERVICE_KEY") ||
    env("SUPABASE_ANON_KEY") ||
    env("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  if (!url || !key) throw new Error("missing_supabase_env");

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

function b64url(bytes: Uint8Array) {
  const b64 = Buffer.from(bytes).toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function sha256b64url(input: string) {
  const data = new TextEncoder().encode(input);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", data);
  return b64url(new Uint8Array(digest));
}

async function randomTokenB64url(lengthBytes = 32) {
  const bytes = new Uint8Array(lengthBytes);
  globalThis.crypto.getRandomValues(bytes);
  return b64url(bytes);
}

function redirectKiosk(err: string) {
  return NextResponse.redirect(`https://www.ukepenger.no/kiosk?claim_error=${encodeURIComponent(err)}`, {
    status: 303,
  });
}

function redirectKidsWithCookie(token: string) {
  const res = NextResponse.redirect("https://www.ukepenger.no/kids", { status: 303 });

  res.headers.set("Cache-Control", "no-store");

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

type Candidate = {
  table: string;
  idCol: string;
  codeCols: string[];
  secretCols: string[];
  secretHashCols: string[];
  tokenCols: string[];
  claimedAtCols: string[];
};

const CANDIDATES: Candidate[] = [
  {
    table: "kiosk_devices",
    idCol: "id",
    codeCols: ["claim_code", "code", "pairing_code"],
    secretCols: ["claim_secret", "secret", "pairing_secret"],
    secretHashCols: ["claim_secret_hash", "secret_hash", "pairing_secret_hash"],
    tokenCols: ["kiosk_token", "session_token", "token"],
    claimedAtCols: ["claimed_at", "paired_at"],
  },
  {
    table: "devices",
    idCol: "id",
    codeCols: ["claim_code", "code", "pairing_code"],
    secretCols: ["claim_secret", "secret", "pairing_secret"],
    secretHashCols: ["claim_secret_hash", "secret_hash", "pairing_secret_hash"],
    tokenCols: ["kiosk_token", "session_token", "token"],
    claimedAtCols: ["claimed_at", "paired_at"],
  },
];

async function tryClaimByTable(code: string, secret: string) {
  const sb: any = supabaseAdmin();

  const secretHash = await sha256b64url(secret);

  for (const c of CANDIDATES) {
    const selectCols = [
      c.idCol,
      ...new Set([...c.codeCols, ...c.secretCols, ...c.secretHashCols, ...c.tokenCols, ...c.claimedAtCols]),
    ].join(",");

    for (const codeCol of c.codeCols) {
      const sel: any = await sb.from(c.table).select(selectCols).eq(codeCol, code).maybeSingle();
      if (sel?.error || !sel?.data) continue;

      const row: any = sel.data;

      const rawOk = c.secretCols.some((k) => typeof row?.[k] === "string" && row[k] === secret);
      const hashOk = c.secretHashCols.some((k) => typeof row?.[k] === "string" && row[k] === secretHash);

      if (!rawOk && !hashOk) return { ok: false as const, reason: "secret_mismatch" as const };

      let token: string | null = null;
      for (const tk of c.tokenCols) {
        if (typeof row?.[tk] === "string" && row[tk].length > 0) {
          token = row[tk];
          break;
        }
      }

      if (!token) {
        token = await randomTokenB64url(32);

        const tokenCol =
          c.tokenCols.find((k) => Object.prototype.hasOwnProperty.call(row, k)) || c.tokenCols[0];

        const patch: any = {};
        patch[tokenCol] = token;
        const claimedCol =
          c.claimedAtCols.find((k) => Object.prototype.hasOwnProperty.call(row, k)) || c.claimedAtCols[0];
        patch[claimedCol] = new Date().toISOString();

        await sb.from(c.table).update(patch).eq(c.idCol, row[c.idCol]);
      } else {
        const claimedCol =
          c.claimedAtCols.find((k) => Object.prototype.hasOwnProperty.call(row, k)) || c.claimedAtCols[0];
        const patch: any = {};
        patch[claimedCol] = new Date().toISOString();
        await sb.from(c.table).update(patch).eq(c.idCol, row[c.idCol]);
      }

      return { ok: true as const, token };
    }
  }

  return { ok: false as const, reason: "not_found" as const };
}

export async function GET(req: Request) {
  try {
    const u = new URL(req.url);
    const code = (u.searchParams.get("code") || "").trim();
    const secret = (u.searchParams.get("secret") || "").trim();

    if (!code || !secret) return redirectKiosk("missing_params");

    try {
      const sb: any = supabaseAdmin();
      const rpc: any = await sb.rpc("kiosk_claim", { code, secret });
      if (rpc && !rpc.error && rpc.data) {
        const d = Array.isArray(rpc.data) ? rpc.data[0] : rpc.data;
        const token = d?.kiosk_token ?? d?.token ?? d?.session_token ?? d?.uk_kiosk ?? null;
        if (typeof token === "string" && token.length > 0) return redirectKidsWithCookie(token);
      }
    } catch {
    }

    const result = await tryClaimByTable(code, secret);

    if (!result.ok) {
      if (result.reason === "not_found") return redirectKiosk("invalid_device");
      if (result.reason === "secret_mismatch") return redirectKiosk("invalid_secret");
      return redirectKiosk("invalid_device");
    }

    return redirectKidsWithCookie(result.token);
  } catch (e) {
    console.error("[kiosk/claim] error", e);
    return redirectKiosk("server_error");
  }
}
