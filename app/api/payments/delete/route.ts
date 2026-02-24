import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

type PaymentRow = {
  id: string;
  family_id: string;
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

  const body = (await request.json()) as { paymentId?: string };
  const paymentId = body.paymentId?.trim();

  if (!paymentId) {
    return NextResponse.json({ error: "Mangler paymentId." }, { status: 400 });
  }

  const paymentRes = await serviceClient
    .from("payments")
    .select("id, family_id")
    .eq("id", paymentId)
    .maybeSingle();

  if (paymentRes.error) {
    return NextResponse.json({ error: paymentRes.error.message }, { status: 400 });
  }

  if (!paymentRes.data) {
    return NextResponse.json({ error: "Fant ikke utbetaling." }, { status: 404 });
  }

  const payment = paymentRes.data as PaymentRow;
  if (payment.family_id !== adminFamilyId) {
    return NextResponse.json({ error: "Ingen tilgang til utbetalingen." }, { status: 403 });
  }

  const claimsRes = await serviceClient
    .from("payment_claims")
    .select("claim_id")
    .eq("payment_id", paymentId);

  if (claimsRes.error) {
    return NextResponse.json({ error: claimsRes.error.message }, { status: 400 });
  }

  const claimIds = Array.from(
    new Set((claimsRes.data ?? []).map((row) => row.claim_id as string).filter(Boolean))
  );

  if (claimIds.length > 0) {
    const revertRes = await serviceClient
      .from("claims")
      .update({ status: "APPROVED", paid_at: null })
      .in("id", claimIds)
      .eq("status", "PAID");

    if (revertRes.error) {
      return NextResponse.json({ error: revertRes.error.message }, { status: 400 });
    }
  }

  const deleteRes = await serviceClient.from("payments").delete().eq("id", paymentId);
  if (deleteRes.error) {
    return NextResponse.json({ error: deleteRes.error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, revertedClaims: claimIds.length });
}
