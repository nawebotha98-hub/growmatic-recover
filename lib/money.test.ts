import { describe, expect, it } from "vitest";
import { formatRand, parseRandToCents } from "./money";

describe("formatRand", () => {
  it("formats whole rand amounts with no decimals", () => {
    // en-ZA uses a space (sometimes non-breaking) as the thousands separator,
    // not a comma — compare digits only so the test doesn't depend on which
    // whitespace character Node's ICU data happens to use.
    const digitsOnly = formatRand(1_000_00).replace(/[^0-9]/g, "");
    expect(digitsOnly).toBe("1000");
  });

  it("formats zero", () => {
    expect(formatRand(0)).toMatch(/R\s*0/);
  });
});

describe("parseRandToCents", () => {
  it("parses a plain number", () => {
    expect(parseRandToCents("20000")).toBe(20_000_00);
  });

  it("parses a rand-prefixed value with a thousands comma and dot decimal", () => {
    expect(parseRandToCents("R20,000.50")).toBe(2_000_050);
  });

  it("parses a value with thousands commas and no decimal", () => {
    expect(parseRandToCents("R 1,234,567")).toBe(1_234_567_00);
  });

  it("treats a lone comma followed by two digits as a decimal separator", () => {
    // Sage/Pastel-style export: "R20 000,50" means twenty thousand rand fifty cents.
    expect(parseRandToCents("R20 000,50")).toBe(2_000_050);
  });

  it("treats a comma NOT followed by exactly two digits as a thousands separator", () => {
    expect(parseRandToCents("20,000")).toBe(20_000_00);
  });

  it("handles a plain decimal with a dot", () => {
    expect(parseRandToCents("149.99")).toBe(149_99);
  });

  it("returns null for empty input", () => {
    expect(parseRandToCents("")).toBeNull();
  });

  it("returns null for non-numeric input", () => {
    expect(parseRandToCents("TBD")).toBeNull();
  });

  it("returns null for a lone minus sign", () => {
    expect(parseRandToCents("-")).toBeNull();
  });
});
