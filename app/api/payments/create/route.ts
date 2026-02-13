import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

type PaymentMethod = "VIPPS" | "CASH" | "BANK" | "OTHER";

type ClaimRow = {
  id: string;
  family_id: string;
  child_id: string;
  status: string;
  amount_ore: number;
};

function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return { url, anonKey, serviceKey };
}

function parseAuthToken(req: Request) {
  const header = req.headers.get("authorization") ?? "";
  if (!header.toLowerCase().startsWith("bearer ")) return null;
  return header.slice(7).trim();
}

export async function POST(request: Request) {
  const { url, anonKey, serviceKey } = getSupabaseEnv();
  if (!url || !anonKey || !serviceKey) {
    return NextResponse.json({ error: "Supabase env mangler." }, { status: 500 });
  }

  const token = parseAuthToken(request);
  if (!token) {
    return NextResponse.json({ error: "Mangler auth-token." }, { status: 401 });
  }

  const authClient = createClient(url, anonKey);
  const serviceClient = createClient(url, serviceKey);

  const authUserRes = await authClient.auth.getUser(token);
  if (authUserRes.error || !authUserRes.data.user) {
    return NextResponse.json({ error: authUserRes.error?.message ?? "Ugyldig innlogging." }, { status: 401 });
  }
  const user = authUserRes.data.user;

  const profileRes = await serviceClient
    .from("profiles")
    .select("family_id, role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileRes.error || !profileRes.data) {
    return NextResponse.json({ error: profileRes.error?.message ?? "Fant ikke admin-profil." }, { status: 403 });
  }

  const adminFamilyId = profileRes.data.family_id as string;

  const body = (await request.json()) as {
    childId?: string;
    claimIds?: string[];
    method?: PaymentMethod;
    note?: string;
  };

  const childId = body.childId?.trim();
  const method = body.method;
  const note = body.note?.trim() ?? null;
  const claimIdsInput = Array.isArray(body.claimIds) ? body.claimIds.map((x) => x?.trim()).filter(Boolean) : [];
  const claimIds = Array.from(new Set(claimIdsInput));

  if (!childId) {
    return NextResponse.json({ error: "Mangler childId." }, { status: 400 });
  }
  if (!claimIds.length) {
    return NextResponse.json({ error: "Velg minst ett krav." }, { status: 400 });
  }
  if (!method || !["VIPPS", "CASH", "BANK", "OTHER"].includes(method)) {
    return NextResponse.json({ error: "Ugyldig betalingsmetode." }, { status: 400 });
  }

  const claimsRes = await serviceClient
    .from("claims")
    .select("id, family_id, child_id, status, amount_ore")
    .in("id", claimIds);

  if (claimsRes.error) {
    return NextResponse.json({ error: claimsRes.error.message }, { status: 400 });
  }

  const claims = (claimsRes.data ?? []) as ClaimRow[];
  if (claims.length !== claimIds.length) {
    return NextResponse.json({ error: "En eller flere krav ble ikke funnet." }, { status: 400 });
  }

  const invalid = claims.find(
    (claim) =>
      claim.family_id !== adminFamilyId ||
      claim.child_id !== childId ||
      claim.status !== "APPROVED"
  );
  if (invalid) {
    return NextResponse.json(
      { error: "Alle krav må være APPROVED, tilhøre valgt barn og din familie." },
      { status: 400 }
    );
  }

  const amountOre = claims.reduce((sum, claim) => sum + claim.amount_ore, 0);

  const paymentInsert = await serviceClient
    .from("payments")
    .insert({
      family_id: adminFamilyId,
      child_id: childId,
      method,
      amount_ore: amountOre,
      note,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (paymentInsert.error || !paymentInsert.data) {
    return NextResponse.json(
      { error: paymentInsert.error?.message ?? "Kunne ikke opprette utbetaling." },
      { status: 400 }
    );
  }

  const paymentId = paymentInsert.data.id as string;

  const links = claimIds.map((claimId) => ({ payment_id: paymentId, claim_id: claimId }));
  const linkInsert = await serviceClient.from("payment_claims").insert(links);
  if (linkInsert.error) {
    return NextResponse.json({ error: linkInsert.error.message }, { status: 400 });
  }

  const updateClaims = await serviceClient
    .from("claims")
    .update({
      status: "PAID",
      paid_at: new Date().toISOString(),
    })
    .in("id", claimIds)
    .eq("status", "APPROVED");

  if (updateClaims.error) {
    return NextResponse.json({ error: updateClaims.error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, paymentId, amount_ore: amountOre });
}
