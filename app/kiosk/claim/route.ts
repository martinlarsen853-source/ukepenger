import { NextResponse } from "next/server";
import { getKioskCookieValue } from "@/lib/device-session";
import { getServiceSupabaseClient } from "@/lib/server-supabase";

type DeviceRow = {
  id: string;
  family_id: string;
  device_secret: string | null;
  active: boolean;
  revoked_at: string | null;
};

export async function GET(request: Request) {
  const queryString = request.url.includes("?") ? request.url.slice(request.url.indexOf("?") + 1) : "";
  const params = new URLSearchParams(queryString);
  const code = params.get("code")?.trim() ?? "";
  const secret = params.get("secret")?.trim() ?? "";

  const failUrl = "https://www.ukepenger.no/login";
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

  const kioskValue = getKioskCookieValue(device.id, secret);
  const response = NextResponse.redirect("https://www.ukepenger.no/kids");
  response.cookies.set({
    name: "uk_kiosk",
    value: kioskValue,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}
