import { describe, expect, it } from "vitest";
import { buildQuoteInsert } from "./import";
import type { ColumnMapping } from "./ai/mapColumns";

const COMPANY_ID = "11111111-1111-1111-1111-111111111111";

const FULL_MAPPING: ColumnMapping = {
  customer_name: "Customer",
  quote_number: "Quote No",
  value: "Value (excl)",
  sent_at: "Date Sent",
  status: "Status",
};

describe("buildQuoteInsert", () => {
  it("builds a clean record from a well-formed row", () => {
    const { record, skippedReason } = buildQuoteInsert(
      {
        Customer: "Acme Solar",
        "Quote No": "Q-1042",
        "Value (excl)": "R148,500.00",
        "Date Sent": "2026-06-01",
        Status: "Sent",
      },
      FULL_MAPPING,
      COMPANY_ID
    );

    expect(skippedReason).toBeNull();
    expect(record).toMatchObject({
      company_id: COMPANY_ID,
      customer_name: "Acme Solar",
      quote_number: "Q-1042",
      value_cents: 148_500_00,
      sent_at: "2026-06-01",
      status: "open",
    });
  });

  it("skips a row with no customer name rather than inserting garbage", () => {
    const { record, skippedReason } = buildQuoteInsert(
      { Customer: "  ", "Value (excl)": "1000", "Date Sent": "2026-06-01" },
      FULL_MAPPING,
      COMPANY_ID
    );
    expect(record).toBeNull();
    expect(skippedReason).toBe("missing customer name");
  });

  it("skips a row with an unparseable value instead of defaulting to zero", () => {
    const { record, skippedReason } = buildQuoteInsert(
      { Customer: "Acme", "Value (excl)": "TBD", "Date Sent": "2026-06-01" },
      FULL_MAPPING,
      COMPANY_ID
    );
    expect(record).toBeNull();
    expect(skippedReason).toBe("unparseable value");
  });

  it("skips a row with an unparseable date", () => {
    const { record, skippedReason } = buildQuoteInsert(
      { Customer: "Acme", "Value (excl)": "1000", "Date Sent": "not a date" },
      FULL_MAPPING,
      COMPANY_ID
    );
    expect(record).toBeNull();
    expect(skippedReason).toBe("unparseable date");
  });

  it("normalises an 'accepted' status to won", () => {
    const { record } = buildQuoteInsert(
      { Customer: "Acme", "Value (excl)": "1000", "Date Sent": "2026-06-01", Status: "Accepted" },
      FULL_MAPPING,
      COMPANY_ID
    );
    expect(record?.status).toBe("won");
  });

  it("normalises a 'declined' status to lost", () => {
    const { record } = buildQuoteInsert(
      { Customer: "Acme", "Value (excl)": "1000", "Date Sent": "2026-06-01", Status: "Declined" },
      FULL_MAPPING,
      COMPANY_ID
    );
    expect(record?.status).toBe("lost");
  });

  it("defaults an unrecognised status to open rather than guessing won/lost", () => {
    const { record } = buildQuoteInsert(
      { Customer: "Acme", "Value (excl)": "1000", "Date Sent": "2026-06-01", Status: "Pending review" },
      FULL_MAPPING,
      COMPANY_ID
    );
    expect(record?.status).toBe("open");
  });

  it("treats a missing status column as open", () => {
    const noStatusMapping: ColumnMapping = { ...FULL_MAPPING, status: null };
    const { record } = buildQuoteInsert(
      { Customer: "Acme", "Value (excl)": "1000", "Date Sent": "2026-06-01" },
      noStatusMapping,
      COMPANY_ID
    );
    expect(record?.status).toBe("open");
  });

  it("leaves quote_number null when that column isn't mapped", () => {
    const noQuoteNumberMapping: ColumnMapping = { ...FULL_MAPPING, quote_number: null };
    const { record } = buildQuoteInsert(
      { Customer: "Acme", "Value (excl)": "1000", "Date Sent": "2026-06-01" },
      noQuoteNumberMapping,
      COMPANY_ID
    );
    expect(record?.quote_number).toBeNull();
  });

  it("preserves the original row as source_row for audit/debugging", () => {
    const row = { Customer: "Acme", "Value (excl)": "1000", "Date Sent": "2026-06-01" };
    const { record } = buildQuoteInsert(row, FULL_MAPPING, COMPANY_ID);
    expect(record?.source_row).toEqual(row);
  });
});
