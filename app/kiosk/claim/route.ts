import { NextRequest, NextResponse } from "next/server";
import { KIOSK_COOKIE_NAME, getKioskCookieValue } from "@/lib/device-session";
import { getServiceSupabaseClient } from "@/lib/server-supabase";

type DeviceRow = {
  id: string;
  family_id: string;
  device_secret: string | null;
  active: boolean;
  revoked_at: string | null;
};

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")?.trim() ?? "";
  const secret = request.nextUrl.searchParams.get("secret")?.trim() ?? "";

  const failUrl = new URL("/login", request.nextUrl.origin);
  if (!code || !secret) {
    return NextResponse.redirect(failUrl);
  }

  const supabase = getServiceSupabaseClient();
  if (!supabase) {
    return NextResponse.redirect(failUrl);
  }

  const deviceRes = await supabase
    .from("devices")
    .select("id, family_id, device_secret, active, revoked_at")
    .eq("device_code", code)
    .maybeSingle();

  if (deviceRes.error || !deviceRes.data) {
    return NextResponse.redirect(failUrl);
  }

  const device = deviceRes.data as DeviceRow;
  if (!device.active || device.revoked_at || !device.device_secret || device.device_secret !== secret) {
    return NextResponse.redirect(failUrl);
  }

  const response = NextResponse.redirect(new URL("/kids", request.nextUrl.origin));
  response.cookies.set({
    name: KIOSK_COOKIE_NAME,
    value: getKioskCookieValue(device.id, secret),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  });
  return response;
}
