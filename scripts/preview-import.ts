// The "holy sh*t moment" tool, runnable with zero setup — no Supabase, no
// signup, no deployment. Point it at a prospect's real quote export and get
// the revenue-at-risk number on the spot, live, in the room with them.
//
// Usage:
//   npx tsx scripts/preview-import.ts samples/sample-quotes.csv
//
// With ANTHROPIC_API_KEY set in the environment, column mapping is
// AI-assisted; without it, this still works via keyword matching.
import "dotenv/config";
import { readFileSync } from "node:fs";
import Papa from "papaparse";
import { mapColumnsWithAI } from "../lib/ai/mapColumns";
import { buildQuoteInsert } from "../lib/import";
import {
  DEFAULT_THRESHOLDS,
  detectExceptions,
  prioritise,
  revenueAtRiskCents,
  type QuoteForRules,
} from "../lib/rules-engine";
import { formatRand } from "../lib/money";

const PLACEHOLDER_COMPANY_ID = "preview";

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("Usage: npx tsx scripts/preview-import.ts <path-to-quotes.csv>");
    process.exit(1);
  }

  const csvText = readFileSync(filePath, "utf-8");
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  const headers = parsed.meta.fields ?? [];
  if (headers.length === 0) {
    console.error("Couldn't find any column headers in that file.");
    process.exit(1);
  }

  const mapping = await mapColumnsWithAI(headers);
  console.log("\nColumn mapping used:");
  for (const [field, header] of Object.entries(mapping)) {
    console.log(`  ${field.padEnd(14)} → ${header ?? "(not mapped)"}`);
  }

  const skippedReasons: string[] = [];
  const quotes: QuoteForRules[] = [];
  let index = 0;

  for (const row of parsed.data) {
    index++;
    const { record, skippedReason } = buildQuoteInsert(row, mapping, PLACEHOLDER_COMPANY_ID);
    if (!record) {
      skippedReasons.push(`row ${index}: ${skippedReason}`);
      continue;
    }
    quotes.push({
      id: `row-${index}`,
      valueCents: record.value_cents,
      sentAt: new Date(record.sent_at),
      status: record.status,
      outcomeRecordedAt: record.outcome_recorded_at ? new Date(record.outcome_recorded_at) : null,
    });
  }

  const exceptions = detectExceptions(quotes, DEFAULT_THRESHOLDS);
  const atRisk = revenueAtRiskCents(quotes, DEFAULT_THRESHOLDS);
  const queue = prioritise(quotes, exceptions);

  console.log(`\nImported ${quotes.length} quotes, skipped ${skippedReasons.length}.`);
  if (skippedReasons.length > 0) {
    console.log("Skipped rows:");
    skippedReasons.forEach((r) => console.log(`  - ${r}`));
  }

  console.log("\n" + "=".repeat(48));
  console.log(`REVENUE AT RISK: ${formatRand(atRisk)}`);
  console.log(`across ${exceptions.length} quotes with no clear outcome`);
  console.log("=".repeat(48));

  console.log("\nTop of the recovery queue:");
  queue.slice(0, 10).forEach((item, i) => {
    console.log(
      `  ${i + 1}. ${formatRand(item.valueCents).padEnd(14)} ${item.ruleTriggered.padEnd(20)} (${item.daysSinceSent}d, ${item.severity})`
    );
  });
  console.log("");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
