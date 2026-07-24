// The "holy sh*t moment" tool, runnable with zero setup — no Supabase, no
// signup, no deployment. Point it at a prospect's real quote export and get
// the revenue-at-risk number on the spot, live, in the room with them.
//
// Usage:
//   npx tsx scripts/preview-import.ts samples/sample-quotes.csv
//
// For a polished report you can email the owner, use generate-report.ts.
// With ANTHROPIC_API_KEY set, column mapping is AI-assisted; without it,
// this still works via keyword matching.
import "dotenv/config";
import { readFileSync } from "node:fs";
import Papa from "papaparse";
import { mapColumnsWithAI } from "../lib/ai/mapColumns";
import { runAudit } from "../lib/audit";
import { formatRand } from "../lib/money";

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

  const audit = runAudit(parsed.data, mapping);

  console.log(`\nImported ${audit.importedCount} quotes, skipped ${audit.skippedCount}.`);
  if (audit.skippedReasons.length > 0) {
    console.log("Skipped rows:");
    audit.skippedReasons.forEach((r) => console.log(`  - ${r}`));
  }

  console.log("\n" + "=".repeat(48));
  console.log(`REVENUE AT RISK: ${formatRand(audit.revenueAtRiskCents)}`);
  console.log(`across ${audit.flaggedCount} quotes with no clear outcome`);
  console.log("=".repeat(48));

  console.log("\nTop of the recovery queue:");
  audit.queue.slice(0, 10).forEach((item, i) => {
    console.log(
      `  ${i + 1}. ${formatRand(item.valueCents).padEnd(14)} ${item.customerName.slice(0, 22).padEnd(24)} ${item.ruleTriggered.padEnd(20)} (${item.daysSinceSent}d, ${item.severity})`
    );
  });
  console.log("");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
