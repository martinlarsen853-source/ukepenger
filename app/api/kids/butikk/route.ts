import { NextResponse } from "next/server";
import { verifyKioskRequest } from "@/lib/kiosk-auth";
import { getServiceSupabaseClient } from "@/lib/server-supabase";

const VALID_AMOUNTS_ORE = [500, 1000, 2000, 3000, 4000, 5000];

type ChildRow = {
  id: string;
  family_id: string;
  active: boolean;
};

export async function POST(request: Request) {
  const auth = await verifyKioskRequest(request);
  if (!auth) {
    return NextResponse.json({ error: "Kiosk-session mangler eller er ugyldig." }, { status: 401 });
  }

  const body = (await request.json()) as { childId?: string; amountOre?: number };
  const childId = body.childId?.trim() ?? "";
  const amountOre = body.amountOre;

  if (!childId || !amountOre || !VALID_AMOUNTS_ORE.includes(amountOre)) {
    return NextResponse.json({ error: "Ugyldig barn eller beløp." }, { status: 400 });
  }

  const supabase = getServiceSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server mangler service role key." }, { status: 500 });
  }

  const childRes = await supabase
    .from("children")
    .select("id, family_id, active")
    .eq("id", childId)
    .maybeSingle();

  if (childRes.error || !childRes.data) {
    return NextResponse.json({ error: childRes.error?.message ?? "Barn ikke funnet." }, { status: 404 });
  }

  const child = childRes.data as ChildRow;

  if (!child.active) {
    return NextResponse.json({ error: "Barnet er inaktivt." }, { status: 400 });
  }

  if (child.family_id !== auth.familyId) {
    return NextResponse.json({ error: "Ingen tilgang til familien." }, { status: 403 });
  }

  const insertRes = await supabase.from("claims").insert({
    family_id: auth.familyId,
    child_id: childId,
    task_id: null,
    amount_ore: amountOre,
    status: "APPROVED",
    decided_at: new Date().toISOString(),
  });

  if (insertRes.error) {
    return NextResponse.json({ error: insertRes.error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
