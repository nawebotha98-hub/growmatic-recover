import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { ProfileRow, QuoteRow } from "@/lib/types";
import type { QuoteForRules } from "@/lib/rules-engine";

/**
 * Every dashboard/queue page calls this first. Row-level security means the
 * quotes query below would return zero rows for a signed-out or profile-less
 * user anyway, but failing fast with a clear redirect is a better experience
 * than a silently-empty dashboard.
 */
export async function requireProfile(): Promise<ProfileRow> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("NOT_AUTHENTICATED");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, company_id, full_name, role")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    throw new Error("NO_PROFILE");
  }

  return profile as ProfileRow;
}

export async function getQuotesForCompany(companyId: string): Promise<QuoteRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quotes")
    .select(
      "id, company_id, customer_name, quote_number, value_cents, sent_at, status, outcome_recorded_at, created_at"
    )
    .eq("company_id", companyId)
    .order("sent_at", { ascending: false });

  if (error) throw error;
  return data as QuoteRow[];
}

export function toRulesInput(quote: QuoteRow): QuoteForRules {
  return {
    id: quote.id,
    valueCents: quote.value_cents,
    sentAt: new Date(quote.sent_at),
    status: quote.status,
    outcomeRecordedAt: quote.outcome_recorded_at ? new Date(quote.outcome_recorded_at) : null,
  };
}
