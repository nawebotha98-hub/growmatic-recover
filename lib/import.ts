import { parseRandToCents } from "@/lib/money";
import type { ColumnMapping } from "@/lib/ai/mapColumns";

export interface QuoteInsert {
  company_id: string;
  customer_name: string;
  quote_number: string | null;
  value_cents: number;
  sent_at: string; // YYYY-MM-DD
  status: "open" | "won" | "lost";
  outcome_recorded_at: string | null;
  source_row: Record<string, unknown>;
}

const WON_WORDS = ["won", "accept", "approved", "confirmed", "paid", "deposit"];
const LOST_WORDS = ["lost", "declin", "reject", "cancel", "expired"];

function normaliseStatus(raw: string | undefined): "open" | "won" | "lost" {
  if (!raw) return "open";
  const value = raw.toLowerCase();
  if (WON_WORDS.some((w) => value.includes(w))) return "won";
  if (LOST_WORDS.some((w) => value.includes(w))) return "lost";
  return "open";
}

function normaliseDate(raw: string | undefined): string | null {
  if (!raw) return null;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

export interface ImportRowResult {
  record: QuoteInsert | null;
  skippedReason: string | null;
}

/**
 * Turns one raw CSV row into a row ready to insert, using the confirmed
 * column mapping. Rows that can't produce a customer name, value, or date
 * are skipped rather than silently coerced to zero/garbage — the import
 * summary reports how many rows were skipped and why.
 */
export function buildQuoteInsert(
  row: Record<string, string>,
  mapping: ColumnMapping,
  companyId: string
): ImportRowResult {
  const customerName = mapping.customer_name ? row[mapping.customer_name]?.trim() : undefined;
  const valueRaw = mapping.value ? row[mapping.value] : undefined;
  const sentAtRaw = mapping.sent_at ? row[mapping.sent_at] : undefined;

  if (!customerName) return { record: null, skippedReason: "missing customer name" };

  const valueCents = valueRaw ? parseRandToCents(valueRaw) : null;
  if (valueCents === null) return { record: null, skippedReason: "unparseable value" };

  const sentAt = normaliseDate(sentAtRaw);
  if (!sentAt) return { record: null, skippedReason: "unparseable date" };

  return {
    record: {
      company_id: companyId,
      customer_name: customerName,
      quote_number: mapping.quote_number ? row[mapping.quote_number] ?? null : null,
      value_cents: valueCents,
      sent_at: sentAt,
      status: normaliseStatus(mapping.status ? row[mapping.status] : undefined),
      outcome_recorded_at: null,
      source_row: row,
    },
    skippedReason: null,
  };
}
