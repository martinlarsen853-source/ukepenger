import { NextResponse } from "next/server";
import { getKioskCookieValue } from "@/lib/device-session";
import { getServiceSupabaseClient } from "@/lib/server-supabase";

export const runtime = "nodejs";

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

    const supabase = getServiceSupabaseClient();
    if (!supabase) {
      return redirectKiosk("server_error");
    }

    const result = await supabase
      .from("devices")
      .select("id, device_secret, active, revoked_at")
      .eq("device_code", code)
      .eq("active", true)
      .is("revoked_at", null)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (result.error || !result.data) {
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
      value: getKioskCookieValue(row.id, row.device_secret),
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 31536000,
    });
    response.cookies.set({
      name: "uk_kid",
      value: "",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return response;
  } catch {
    return redirectKiosk("server_error");
  }
}
