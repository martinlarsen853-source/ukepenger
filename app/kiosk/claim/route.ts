import { NextResponse } from "next/server";
import { getKioskCookieValue } from "@/lib/device-session";
import { getServiceSupabaseClient } from "@/lib/server-supabase";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const code = (url.searchParams.get("code") ?? "").trim();
    const secret = (url.searchParams.get("secret") ?? "").trim();

    if (!code || !secret) {
      return NextResponse.redirect(`${url.origin}/kiosk?claim_error=missing_params`, { status: 303 });
    }

    const supabase = getServiceSupabaseClient();
    if (!supabase) {
      return NextResponse.redirect(`${url.origin}/kiosk?claim_error=server_error`, { status: 303 });
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
      return NextResponse.redirect(`${url.origin}/kiosk?claim_error=invalid_device`, { status: 303 });
    }

    const row = result.data as {
      id: string;
      device_secret: string | null;
      active: boolean;
      revoked_at: string | null;
    };
    if (!row.active || row.revoked_at || !row.device_secret) {
      return NextResponse.redirect(`${url.origin}/kiosk?claim_error=invalid_device`, { status: 303 });
    }

    if (row.device_secret !== secret) {
      return NextResponse.redirect(`${url.origin}/kiosk?claim_error=invalid_secret`, { status: 303 });
    }

    const response = NextResponse.redirect(`${url.origin}/kids`, { status: 303 });
    response.cookies.set({
      name: "uk_kiosk",
      value: getKioskCookieValue(row.id, row.device_secret),
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 31536000,
    });
    return response;
  } catch {
    return NextResponse.redirect(`${new URL(request.url).origin}/kiosk?claim_error=server_error`, { status: 303 });
  }
}
