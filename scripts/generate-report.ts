// Generate a professional, emailable Revenue-at-Risk audit report from a
// prospect's CSV export. This is the artefact you send an owner after a first
// conversation — the sales weapon Month 1 of the blueprint is built around.
//
// Usage:
//   npx tsx scripts/generate-report.ts <path-to-quotes.csv> "Company Name" [output.html]
//
// The output is a self-contained HTML file. Open it in a browser to read, or
// print to PDF to attach to an email. With ANTHROPIC_API_KEY set, column
// mapping is AI-assisted; without it, it falls back to keyword matching.
import "dotenv/config";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { basename } from "node:path";
import Papa from "papaparse";
import { mapColumnsWithAI } from "../lib/ai/mapColumns";
import { runAudit } from "../lib/audit";
import { renderReportHtml } from "../lib/reportHtml";
import { formatRand } from "../lib/money";

async function main() {
  const [, , csvPath, companyNameArg, outputArg] = process.argv;
  if (!csvPath || !companyNameArg) {
    console.error(
      'Usage: npx tsx scripts/generate-report.ts <quotes.csv> "Company Name" [output.html]'
    );
    process.exit(1);
  }

  const csvText = readFileSync(csvPath, "utf-8");
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });
  const headers = parsed.meta.fields ?? [];
  if (headers.length === 0) {
    console.error("No column headers found in that file.");
    process.exit(1);
  }

  const mapping = await mapColumnsWithAI(headers);
  const audit = runAudit(parsed.data, mapping);
  const html = renderReportHtml(audit, { companyName: companyNameArg });

  // Reports contain a real business's data — write them into a gitignored
  // folder so they never get committed by accident.
  mkdirSync("reports", { recursive: true });
  const safeName = companyNameArg.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const outPath = outputArg ?? `reports/${safeName || basename(csvPath, ".csv")}-audit.html`;
  writeFileSync(outPath, html, "utf-8");

  console.log(`\nReport written to: ${outPath}`);
  console.log(`Revenue at risk:   ${formatRand(audit.revenueAtRiskCents)}`);
  console.log(`Flagged:           ${audit.flaggedCount} of ${audit.importedCount} quotes`);
  if (audit.skippedCount > 0) {
    console.log(`Skipped rows:      ${audit.skippedCount} (unreadable — see report methodology note)`);
  }
  console.log(`\nOpen it in a browser, then print to PDF to send it.\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
