import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getKioskCookieValue } from "@/lib/device-session";

export const runtime = "nodejs";

function getEnv(key: string) {
  const v = process.env[key];
  return typeof v === "string" && v.length > 0 ? v : null;
}

function getSupabaseAdmin() {
  const url =
    getEnv("SUPABASE_URL") ||
    getEnv("NEXT_PUBLIC_SUPABASE_URL");

  const key =
    // preferred (server)
    getEnv("SUPABASE_SERVICE_ROLE_KEY") ||
    getEnv("SUPABASE_SERVICE_KEY") ||
    // fallback (server anon)
    getEnv("SUPABASE_ANON_KEY") ||
    // last resort (public anon)
    getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  if (!url || !key) throw new Error("Supabase env missing (URL/KEY)");

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { "X-Client-Info": "ukepenger-kiosk-claim" } },
  });
}

function redirectToKiosk(error: string) {
  return NextResponse.redirect(`https://www.ukepenger.no/kiosk?claim_error=${encodeURIComponent(error)}`, {
    status: 303,
  });
}

async function claimToken(code: string, secret: string): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  const deviceRes: any = await (supabase as any)
    .from("devices")
    .select("id, device_secret, active, revoked_at")
    .eq("device_code", code)
    .maybeSingle();

  if (deviceRes?.error || !deviceRes?.data) return null;

  const device = deviceRes.data as {
    id: string;
    device_secret: string | null;
    active: boolean;
    revoked_at: string | null;
  };

  if (!device.active || device.revoked_at || !device.device_secret || device.device_secret !== secret) {
    return null;
  }

  return getKioskCookieValue(device.id, secret);
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = (url.searchParams.get("code") || "").trim();
    const secret = (url.searchParams.get("secret") || "").trim();

    if (!code || !secret) return redirectToKiosk("missing_params");

    const token = await claimToken(code, secret);
    if (!token) return redirectToKiosk("invalid_or_unclaimed");

    const res = NextResponse.redirect("https://www.ukepenger.no/kids", { status: 303 });

    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.headers.set("Pragma", "no-cache");
    res.headers.set("Expires", "0");

    res.cookies.set({
      name: "uk_kiosk",
      value: token,
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      domain: ".ukepenger.no",
      maxAge: 60 * 60 * 24 * 365,
    });

    return res;
  } catch (e) {
    console.error("[kiosk/claim] error:", e);
    return redirectToKiosk("server_error");
  }
}
