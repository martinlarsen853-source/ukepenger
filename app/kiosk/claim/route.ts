import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function getEnv(key: string) {
  const value = process.env[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function redirectKiosk(error: string) {
  return NextResponse.redirect(`https://www.ukepenger.no/kiosk?claim_error=${encodeURIComponent(error)}`, { status: 303 });
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const code = (url.searchParams.get("code") ?? "").trim();
    const secret = (url.searchParams.get("secret") ?? "").trim();

    if (!code || !secret) {
      return redirectKiosk("missing_params");
    }

    const supabaseUrl = getEnv("SUPABASE_URL") ?? getEnv("NEXT_PUBLIC_SUPABASE_URL");
    const supabaseKey =
      getEnv("SUPABASE_SERVICE_ROLE_KEY") ??
      getEnv("SUPABASE_SERVICE_KEY") ??
      getEnv("SUPABASE_ANON_KEY") ??
      getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseKey) {
      return redirectKiosk("server_error");
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });

    const result = await supabase
      .from("devices")
      .select("id, device_secret, active, revoked_at")
      .eq("device_code", code)
      .single();

    if (result.error) {
      return redirectKiosk("invalid_device");
    }

    const row = result.data as {
      id: string;
      device_secret: string | null;
      active: boolean;
      revoked_at: string | null;
    };
    if (!row.active || row.revoked_at || !row.device_secret) {
      return redirectKiosk("invalid_device");
    }

    if (row.device_secret !== secret) {
      return redirectKiosk("invalid_secret");
    }

    const response = NextResponse.redirect("https://www.ukepenger.no/kids", { status: 303 });
    response.cookies.set({
      name: "uk_kiosk",
      value: `${row.id}:${row.device_secret}`,
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 31536000,
    });
    return response;
  } catch {
    return redirectKiosk("server_error");
  }
}
