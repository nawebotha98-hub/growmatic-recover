// The entire "detection" side of GrowMatic Recover lives in this file, on purpose.
// It is plain, deterministic, and fully unit-tested — see rules-engine.test.ts.
// AI never decides *whether* something is an exception; it only helps interpret
// messy customer replies elsewhere (see lib/ai/mapColumns.ts).

export type QuoteStatus = 'open' | 'won' | 'lost';
export type RuleTriggered = 'stale_no_followup' | 'no_recorded_outcome';
export type Severity = 'low' | 'medium' | 'high';

export interface QuoteForRules {
  id: string;
  valueCents: number;
  sentAt: Date;
  status: QuoteStatus;
  outcomeRecordedAt: Date | null;
}

export interface RuleThresholds {
  /** Days with no follow-up logged before a quote is flagged as going stale. */
  staleAfterDays: number;
  /** Days with no recorded outcome before a quote is flagged as a bigger risk. */
  noOutcomeAfterDays: number;
  /** Quote value (in cents) above which a stale quote is escalated to high severity. */
  highValueStaleCents: number;
  /** Quote value (in cents) above which a no-outcome quote is escalated to high severity. */
  highValueNoOutcomeCents: number;
}

export const DEFAULT_THRESHOLDS: RuleThresholds = {
  staleAfterDays: 14,
  noOutcomeAfterDays: 30,
  highValueStaleCents: 10_000_00, // R100,000
  highValueNoOutcomeCents: 5_000_00, // R50,000
};

export interface DetectedException {
  quoteId: string;
  ruleTriggered: RuleTriggered;
  severity: Severity;
  daysSinceSent: number;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function daysBetween(earlier: Date, later: Date): number {
  return Math.floor((later.getTime() - earlier.getTime()) / MS_PER_DAY);
}

/**
 * Decide whether a single quote should be flagged right now.
 * Returns null when nothing is wrong: closed quotes and quotes with a
 * recorded outcome are never exceptions, no matter how old they are.
 */
export function detectException(
  quote: QuoteForRules,
  thresholds: RuleThresholds = DEFAULT_THRESHOLDS,
  now: Date = new Date()
): DetectedException | null {
  if (quote.status !== 'open') return null;
  if (quote.outcomeRecordedAt !== null) return null;

  const daysSinceSent = daysBetween(quote.sentAt, now);

  if (daysSinceSent >= thresholds.noOutcomeAfterDays) {
    return {
      quoteId: quote.id,
      ruleTriggered: 'no_recorded_outcome',
      severity: quote.valueCents >= thresholds.highValueNoOutcomeCents ? 'high' : 'medium',
      daysSinceSent,
    };
  }

  if (daysSinceSent >= thresholds.staleAfterDays) {
    return {
      quoteId: quote.id,
      ruleTriggered: 'stale_no_followup',
      severity: quote.valueCents >= thresholds.highValueStaleCents ? 'high' : 'low',
      daysSinceSent,
    };
  }

  return null;
}

/** Run detection across a whole book of quotes in one pass. */
export function detectExceptions(
  quotes: QuoteForRules[],
  thresholds: RuleThresholds = DEFAULT_THRESHOLDS,
  now: Date = new Date()
): DetectedException[] {
  const results: DetectedException[] = [];
  for (const quote of quotes) {
    const exception = detectException(quote, thresholds, now);
    if (exception) results.push(exception);
  }
  return results;
}

/** The one number the dashboard leads with: total rand value currently flagged. */
export function revenueAtRiskCents(
  quotes: QuoteForRules[],
  thresholds: RuleThresholds = DEFAULT_THRESHOLDS,
  now: Date = new Date()
): number {
  const flaggedIds = new Set(detectExceptions(quotes, thresholds, now).map((e) => e.quoteId));
  return quotes.filter((q) => flaggedIds.has(q.id)).reduce((sum, q) => sum + q.valueCents, 0);
}

/** Sort exceptions the way the recovery queue should show them: highest value, oldest, first. */
export function prioritise(
  quotes: QuoteForRules[],
  exceptions: DetectedException[]
): Array<DetectedException & { valueCents: number }> {
  const byId = new Map(quotes.map((q) => [q.id, q]));
  return [...exceptions]
    .map((e) => ({ ...e, valueCents: byId.get(e.quoteId)?.valueCents ?? 0 }))
    .sort((a, b) => b.valueCents - a.valueCents || b.daysSinceSent - a.daysSinceSent);
}
