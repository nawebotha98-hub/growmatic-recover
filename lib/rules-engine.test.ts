import { describe, expect, it } from 'vitest';
import {
  DEFAULT_THRESHOLDS,
  detectException,
  detectExceptions,
  prioritise,
  revenueAtRiskCents,
  type QuoteForRules,
} from './rules-engine';

const NOW = new Date('2026-07-23T00:00:00Z');

function daysAgo(days: number): Date {
  return new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000);
}

function quote(overrides: Partial<QuoteForRules> = {}): QuoteForRules {
  return {
    id: 'q1',
    valueCents: 20_000_00, // R20,000
    sentAt: daysAgo(5),
    status: 'open',
    outcomeRecordedAt: null,
    ...overrides,
  };
}

describe('detectException', () => {
  it('does not flag a fresh open quote', () => {
    expect(detectException(quote({ sentAt: daysAgo(3) }), DEFAULT_THRESHOLDS, NOW)).toBeNull();
  });

  it('flags a quote as stale once it crosses the stale threshold', () => {
    const result = detectException(quote({ sentAt: daysAgo(14) }), DEFAULT_THRESHOLDS, NOW);
    expect(result?.ruleTriggered).toBe('stale_no_followup');
    expect(result?.daysSinceSent).toBe(14);
  });

  it('escalates to no_recorded_outcome once it crosses the longer threshold', () => {
    const result = detectException(quote({ sentAt: daysAgo(30) }), DEFAULT_THRESHOLDS, NOW);
    expect(result?.ruleTriggered).toBe('no_recorded_outcome');
  });

  it('marks a stale quote at/above R100,000 as high severity', () => {
    const result = detectException(
      quote({ sentAt: daysAgo(15), valueCents: 120_000_00 }), // R120,000
      DEFAULT_THRESHOLDS,
      NOW
    );
    expect(result?.severity).toBe('high');
  });

  it('marks a stale quote below R100,000 as low severity', () => {
    const result = detectException(
      quote({ sentAt: daysAgo(15), valueCents: 40_000_00 }), // R40,000 — real deal size, not "high"
      DEFAULT_THRESHOLDS,
      NOW
    );
    expect(result?.severity).toBe('low');
  });

  it('marks a no-outcome quote at/above R50,000 as high severity', () => {
    const result = detectException(
      quote({ sentAt: daysAgo(35), valueCents: 60_000_00 }), // R60,000
      DEFAULT_THRESHOLDS,
      NOW
    );
    expect(result?.ruleTriggered).toBe('no_recorded_outcome');
    expect(result?.severity).toBe('high');
  });

  it('marks a no-outcome quote below R50,000 as medium severity', () => {
    const result = detectException(
      quote({ sentAt: daysAgo(35), valueCents: 20_000_00 }), // R20,000
      DEFAULT_THRESHOLDS,
      NOW
    );
    expect(result?.severity).toBe('medium');
  });

  it('never flags a won quote, no matter how old', () => {
    expect(
      detectException(quote({ sentAt: daysAgo(90), status: 'won' }), DEFAULT_THRESHOLDS, NOW)
    ).toBeNull();
  });

  it('never flags a lost quote', () => {
    expect(
      detectException(quote({ sentAt: daysAgo(90), status: 'lost' }), DEFAULT_THRESHOLDS, NOW)
    ).toBeNull();
  });

  it('never flags a quote with a recorded outcome, even if still "open"', () => {
    expect(
      detectException(
        quote({ sentAt: daysAgo(90), outcomeRecordedAt: daysAgo(1) }),
        DEFAULT_THRESHOLDS,
        NOW
      )
    ).toBeNull();
  });
});

describe('revenueAtRiskCents', () => {
  it('sums only the flagged quotes, ignoring fresh and closed ones', () => {
    const quotes: QuoteForRules[] = [
      quote({ id: 'fresh', sentAt: daysAgo(2), valueCents: 100_000_00 }),
      quote({ id: 'stale', sentAt: daysAgo(20), valueCents: 30_000_00 }),
      quote({ id: 'won', sentAt: daysAgo(60), status: 'won', valueCents: 500_000_00 }),
      quote({ id: 'no-outcome', sentAt: daysAgo(45), valueCents: 70_000_00 }),
    ];
    expect(revenueAtRiskCents(quotes, DEFAULT_THRESHOLDS, NOW)).toBe(30_000_00 + 70_000_00);
  });

  it('is zero for an empty book', () => {
    expect(revenueAtRiskCents([], DEFAULT_THRESHOLDS, NOW)).toBe(0);
  });
});

describe('prioritise', () => {
  it('orders the recovery queue by value first, then age', () => {
    const quotes: QuoteForRules[] = [
      quote({ id: 'small-old', sentAt: daysAgo(40), valueCents: 10_000_00 }),
      quote({ id: 'big-new', sentAt: daysAgo(15), valueCents: 200_000_00 }),
      quote({ id: 'big-old', sentAt: daysAgo(40), valueCents: 200_000_00 }),
    ];
    const exceptions = detectExceptions(quotes, DEFAULT_THRESHOLDS, NOW);
    const ordered = prioritise(quotes, exceptions).map((e) => e.quoteId);
    expect(ordered).toEqual(['big-old', 'big-new', 'small-old']);
  });
});
