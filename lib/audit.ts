import { buildQuoteInsert } from "@/lib/import";
import {
  DEFAULT_THRESHOLDS,
  detectExceptions,
  prioritise,
  type QuoteForRules,
  type RuleThresholds,
  type RuleTriggered,
  type Severity,
} from "@/lib/rules-engine";
import type { ColumnMapping } from "@/lib/ai/mapColumns";

export interface AuditQueueItem {
  customerName: string;
  quoteNumber: string | null;
  valueCents: number;
  sentAt: string;
  ruleTriggered: RuleTriggered;
  severity: Severity;
  daysSinceSent: number;
}

export interface AuditResult {
  totalRows: number;
  importedCount: number;
  skippedCount: number;
  skippedReasons: string[];
  /** Total value of every quote we could import, whatever its state. */
  totalImportedValueCents: number;
  /** Value of open, closed-out (won/lost) quotes — i.e. NOT flagged. */
  resolvedValueCents: number;
  /** The headline: value of flagged quotes with no clear outcome. */
  revenueAtRiskCents: number;
  flaggedCount: number;
  staleCount: number;
  staleValueCents: number;
  noOutcomeCount: number;
  noOutcomeValueCents: number;
  queue: AuditQueueItem[];
}

/**
 * The whole audit, from parsed CSV rows to a structured result. This is the
 * single shared code path behind both the terminal preview and the
 * customer-facing report, so they can never drift apart. It reuses the same
 * tested rules engine every dashboard page load uses.
 */
export function runAudit(
  rows: Record<string, string>[],
  mapping: ColumnMapping,
  thresholds: RuleThresholds = DEFAULT_THRESHOLDS,
  now: Date = new Date()
): AuditResult {
  const skippedReasons: string[] = [];
  const rulesInput: QuoteForRules[] = [];
  const detailById = new Map<string, { customerName: string; quoteNumber: string | null }>();

  let index = 0;
  let totalImportedValueCents = 0;

  for (const row of rows) {
    index++;
    const { record, skippedReason } = buildQuoteInsert(row, mapping, "audit");
    if (!record) {
      if (skippedReason) skippedReasons.push(`row ${index}: ${skippedReason}`);
      continue;
    }
    const id = `row-${index}`;
    totalImportedValueCents += record.value_cents;
    rulesInput.push({
      id,
      valueCents: record.value_cents,
      sentAt: new Date(record.sent_at),
      status: record.status,
      outcomeRecordedAt: record.outcome_recorded_at ? new Date(record.outcome_recorded_at) : null,
    });
    detailById.set(id, { customerName: record.customer_name, quoteNumber: record.quote_number });
  }

  const exceptions = detectExceptions(rulesInput, thresholds, now);
  const ordered = prioritise(rulesInput, exceptions);
  const quoteById = new Map(rulesInput.map((q) => [q.id, q]));

  let staleCount = 0;
  let staleValueCents = 0;
  let noOutcomeCount = 0;
  let noOutcomeValueCents = 0;

  const queue: AuditQueueItem[] = ordered.map((item) => {
    const detail = detailById.get(item.quoteId);
    const quote = quoteById.get(item.quoteId);
    const sentAt = quote ? quote.sentAt.toISOString().slice(0, 10) : "";
    if (item.ruleTriggered === "stale_no_followup") {
      staleCount++;
      staleValueCents += item.valueCents;
    } else {
      noOutcomeCount++;
      noOutcomeValueCents += item.valueCents;
    }
    return {
      customerName: detail?.customerName ?? "Unknown",
      quoteNumber: detail?.quoteNumber ?? null,
      valueCents: item.valueCents,
      sentAt,
      ruleTriggered: item.ruleTriggered,
      severity: item.severity,
      daysSinceSent: item.daysSinceSent,
    };
  });

  const revenueAtRiskCents = staleValueCents + noOutcomeValueCents;

  return {
    totalRows: rows.length,
    importedCount: rulesInput.length,
    skippedCount: skippedReasons.length,
    skippedReasons,
    totalImportedValueCents,
    resolvedValueCents: totalImportedValueCents - revenueAtRiskCents,
    revenueAtRiskCents,
    flaggedCount: exceptions.length,
    staleCount,
    staleValueCents,
    noOutcomeCount,
    noOutcomeValueCents,
    queue,
  };
}
