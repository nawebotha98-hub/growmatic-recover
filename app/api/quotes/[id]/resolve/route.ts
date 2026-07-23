import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Logs an outcome for one quote. This is the entire "close the loop" feature —
 * it's what lets the product later claim "GrowMatic helped recover RX this month"
 * with a real, auditable number behind it instead of a guess.
 */
export async function POST(request: Request, ctx: RouteContext<"/api/quotes/[id]/resolve">) {
  const { id: quoteId } = await ctx.params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const outcome = body.outcome as "recovered" | "lost";
  if (outcome !== "recovered" && outcome !== "lost") {
    return NextResponse.json({ error: "outcome must be 'recovered' or 'lost'" }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, company_id")
    .eq("id", user.id)
    .single();
  if (!profile) {
    return NextResponse.json({ error: "No profile for this user" }, { status: 403 });
  }

  // Row-level security scopes this to the caller's own company — a quote ID
  // belonging to another tenant simply won't match and .single() will error.
  const { data: quote, error: quoteError } = await supabase
    .from("quotes")
    .select("id, value_cents, company_id")
    .eq("id", quoteId)
    .single();
  if (quoteError || !quote) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const { error: updateError } = await supabase
    .from("quotes")
    .update({
      status: outcome === "recovered" ? "won" : "lost",
      outcome_recorded_at: today,
    })
    .eq("id", quoteId);
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Close out any still-open exception record for this quote (the audit trail
  // the daily rules run created) and log the resolution against it, if one exists.
  const { data: openException } = await supabase
    .from("exceptions")
    .select("id")
    .eq("quote_id", quoteId)
    .is("resolved_at", null)
    .maybeSingle();

  if (openException) {
    await supabase
      .from("exceptions")
      .update({ resolved_at: new Date().toISOString() })
      .eq("id", openException.id);

    await supabase.from("resolutions").insert({
      exception_id: openException.id,
      outcome,
      recovered_value_cents: outcome === "recovered" ? quote.value_cents : 0,
      resolved_by: profile.id,
    });
  }

  return NextResponse.json({ ok: true });
}
