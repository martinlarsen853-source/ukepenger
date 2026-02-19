import { NextResponse } from "next/server";
import { verifyKioskRequest } from "@/lib/kiosk-auth";
import { getServiceSupabaseClient } from "@/lib/server-supabase";

type ChildRow = {
  id: string;
  name: string;
  avatar_key: string | null;
  color?: string | null;
};

function getCookieValue(request: Request, name: string) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const part = cookieHeader
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`));
  if (!part) return null;
  return decodeURIComponent(part.slice(name.length + 1));
}

export async function GET(request: Request) {
  const auth = await verifyKioskRequest(request);
  if (!auth) {
    return NextResponse.json({ error: "Kiosk-session mangler eller er ugyldig." }, { status: 401 });
  }

  const supabase = getServiceSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server mangler service role key." }, { status: 500 });
  }

  const childrenRes = await supabase
    .from("children")
    .select("id, name, avatar_key")
    .eq("family_id", auth.familyId)
    .eq("active", true)
    .order("name", { ascending: true });

  if (childrenRes.error) {
    return NextResponse.json({ error: childrenRes.error.message }, { status: 400 });
  }

  let selectedChildId: string | null = null;
  const kidCookie = getCookieValue(request, "uk_kid");
  if (kidCookie) {
    const kidRes = await supabase
      .from("children")
      .select("id, family_id, active")
      .eq("id", kidCookie)
      .maybeSingle();

    if (!kidRes.error && kidRes.data && kidRes.data.family_id === auth.familyId && kidRes.data.active) {
      selectedChildId = kidRes.data.id as string;
    }
  }

  const children = ((childrenRes.data ?? []) as ChildRow[]).map((child) => ({ ...child, color: null }));
  return NextResponse.json({ children, selectedChildId });
}
