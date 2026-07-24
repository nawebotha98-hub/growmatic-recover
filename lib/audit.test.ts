import { describe, expect, it } from "vitest";
import { runAudit } from "./audit";
import type { ColumnMapping } from "./ai/mapColumns";

const MAPPING: ColumnMapping = {
  customer_name: "Customer",
  quote_number: "No",
  value: "Value",
  sent_at: "Date",
  status: "Status",
};

const NOW = new Date("2026-07-23T00:00:00Z");

function isoDaysAgo(days: number): string {
  return new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function row(overrides: Partial<Record<string, string>> = {}): Record<string, string> {
  return {
    Customer: "Acme Solar",
    No: "Q-1",
    Value: "50000",
    Date: isoDaysAgo(20),
    Status: "Sent",
    ...overrides,
  };
}

describe("runAudit", () => {
  it("computes the headline revenue-at-risk from flagged quotes only", () => {
    const result = runAudit(
      [
        row({ Customer: "Fresh", Date: isoDaysAgo(2), Value: "999999" }), // too new, not flagged
        row({ Customer: "Stale", Date: isoDaysAgo(20), Value: "30000" }),
        row({ Customer: "Won", Date: isoDaysAgo(60), Value: "500000", Status: "Won" }), // closed
        row({ Customer: "NoOutcome", Date: isoDaysAgo(45), Value: "70000" }),
      ],
      MAPPING,
      undefined,
      NOW
    );
    expect(result.revenueAtRiskCents).toBe(30_000_00 + 70_000_00);
    expect(result.flaggedCount).toBe(2);
    expect(result.importedCount).toBe(4);
  });

  it("splits the breakdown into stale vs no-outcome", () => {
    const result = runAudit(
      [
        row({ Customer: "Stale", Date: isoDaysAgo(18), Value: "10000" }),
        row({ Customer: "NoOutcome", Date: isoDaysAgo(40), Value: "20000" }),
      ],
      MAPPING,
      undefined,
      NOW
    );
    expect(result.staleCount).toBe(1);
    expect(result.staleValueCents).toBe(10_000_00);
    expect(result.noOutcomeCount).toBe(1);
    expect(result.noOutcomeValueCents).toBe(20_000_00);
  });

  it("carries customer names through to the queue, ordered by value", () => {
    const result = runAudit(
      [
        row({ Customer: "Small", Date: isoDaysAgo(20), Value: "10000" }),
        row({ Customer: "Big", Date: isoDaysAgo(20), Value: "200000" }),
      ],
      MAPPING,
      undefined,
      NOW
    );
    expect(result.queue.map((q) => q.customerName)).toEqual(["Big", "Small"]);
  });

  it("reports skipped rows without letting them break the audit", () => {
    const result = runAudit(
      [
        row({ Customer: "Good", Date: isoDaysAgo(20) }),
        row({ Customer: "", Date: isoDaysAgo(20) }), // no customer name
        row({ Customer: "BadValue", Value: "TBD", Date: isoDaysAgo(20) }),
      ],
      MAPPING,
      undefined,
      NOW
    );
    expect(result.importedCount).toBe(1);
    expect(result.skippedCount).toBe(2);
    expect(result.skippedReasons).toHaveLength(2);
  });

  it("resolvedValueCents plus revenueAtRiskCents equals total imported value", () => {
    const result = runAudit(
      [
        row({ Customer: "Flagged", Date: isoDaysAgo(20), Value: "30000" }),
        row({ Customer: "Fresh", Date: isoDaysAgo(1), Value: "40000" }),
      ],
      MAPPING,
      undefined,
      NOW
    );
    expect(result.resolvedValueCents + result.revenueAtRiskCents).toBe(
      result.totalImportedValueCents
    );
  });
});
