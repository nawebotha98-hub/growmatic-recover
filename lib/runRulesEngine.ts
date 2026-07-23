import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { DEFAULT_THRESHOLDS, detectExceptions } from "@/lib/rules-engine";
import type { QuoteRow } from "@/lib/types";

export interface RulesRunSummary {
  checked: number;
  flagged: number;
  newlyCreated: number;
}

/**
 * The daily job, in full. Reads every open, outcome-less quote across every
 * company (this uses the service-role client, so it deliberately bypasses
 * row-level security — nothing here is ever reachable from the browser),
 * runs the same deterministic detection used on every dashboard page load,
 * and persists a new `exceptions` row only for quotes that don't already
 * have one open. That persisted row is the audit trail: what was flagged,
 * when, and how it was eventually resolved.
 */
export async function runRulesEngine(): Promise<RulesRunSummary> {
  const supabase = createServiceRoleClient();

  const { data: quotes, error } = await supabase
    .from("quotes")
    .select("id, company_id, value_cents, sent_at, status, outcome_recorded_at")
    .eq("status", "open")
    .is("outcome_recorded_at", null);

  if (error) throw error;

  const rows = (quotes ?? []) as QuoteRow[];
  const rulesInput = rows.map((q) => ({
    id: q.id,
    valueCents: q.value_cents,
    sentAt: new Date(q.sent_at),
    status: q.status,
    outcomeRecordedAt: q.outcome_recorded_at ? new Date(q.outcome_recorded_at) : null,
  }));

  const detected = detectExceptions(rulesInput, DEFAULT_THRESHOLDS);
  const quoteById = new Map(rows.map((q) => [q.id, q]));

  let newlyCreated = 0;
  for (const exception of detected) {
    const quote = quoteById.get(exception.quoteId);
    if (!quote) continue;

    const { data: existing } = await supabase
      .from("exceptions")
      .select("id")
      .eq("quote_id", exception.quoteId)
      .is("resolved_at", null)
      .maybeSingle();

    if (existing) continue; // already tracked, don't duplicate the audit trail

    const { error: insertError } = await supabase.from("exceptions").insert({
      company_id: quote.company_id,
      quote_id: exception.quoteId,
      rule_triggered: exception.ruleTriggered,
      severity: exception.severity,
      days_since_sent: exception.daysSinceSent,
    });
    if (!insertError) newlyCreated++;
  }

  return { checked: rulesInput.length, flagged: detected.length, newlyCreated };
}
