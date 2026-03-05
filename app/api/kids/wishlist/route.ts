import { NextResponse } from "next/server";
import { verifyKioskRequest } from "@/lib/kiosk-auth";
import { getServiceSupabaseClient } from "@/lib/server-supabase";

type ChildRow = {
  id: string;
  family_id: string;
};

async function extractChildId(request: Request) {
  const url = new URL(request.url);
  const fromQuery = url.searchParams.get("childId")?.trim() ?? "";
  if (fromQuery) return fromQuery;

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) return "";

  try {
    const body = (await request.json()) as { childId?: string };
    return body.childId?.trim() ?? "";
  } catch {
    return "";
  }
}

export async function GET(request: Request) {
  const auth = await verifyKioskRequest(request);
  if (!auth) {
    return NextResponse.json({ error: "Kiosk-session mangler eller er ugyldig." }, { status: 401 });
  }

  const childId = await extractChildId(request);
  if (!childId) {
    return NextResponse.json({ error: "Mangler childId." }, { status: 400 });
  }

  const supabase = getServiceSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server mangler service role key." }, { status: 500 });
  }

  const childRes = await supabase.from("children").select("id, family_id").eq("id", childId).maybeSingle();
  if (childRes.error || !childRes.data) {
    return NextResponse.json({ error: childRes.error?.message ?? "Barn ikke funnet." }, { status: 404 });
  }

  const child = childRes.data as ChildRow;
  if (child.family_id !== auth.familyId) {
    return NextResponse.json({ error: "Ingen tilgang til barnet." }, { status: 403 });
  }

  const itemsRes = await supabase
    .from("wishlist_items")
    .select("id, title, target_ore, note, created_at")
    .eq("family_id", auth.familyId)
    .eq("child_id", childId)
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (itemsRes.error) {
    return NextResponse.json({ error: itemsRes.error.message }, { status: 400 });
  }

  return NextResponse.json({ items: itemsRes.data ?? [] });
}

