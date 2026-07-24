import type { AuditResult } from "@/lib/audit";
import { formatRand } from "@/lib/money";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const RULE_LABEL: Record<string, string> = {
  stale_no_followup: "Stale — no follow-up recorded",
  no_recorded_outcome: "No recorded outcome",
};

const SEVERITY_LABEL: Record<string, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export interface ReportOptions {
  companyName: string;
  /** How far back the data goes, in plain words, e.g. "the last 6 months". Optional. */
  periodLabel?: string;
  preparedOn?: Date;
  queueLimit?: number;
}

/**
 * Renders a self-contained, emailable HTML audit report — the artefact you
 * hand a prospect. No external assets, prints cleanly to PDF from any browser.
 * Every customer-supplied string is HTML-escaped.
 */
export function renderReportHtml(audit: AuditResult, options: ReportOptions): string {
  const company = escapeHtml(options.companyName);
  const preparedOn = options.preparedOn ?? new Date();
  const dateStr = preparedOn.toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const queueLimit = options.queueLimit ?? 15;
  const shownQueue = audit.queue.slice(0, queueLimit);
  const remaining = audit.queue.length - shownQueue.length;

  const queueRows = shownQueue
    .map(
      (item, i) => `
      <tr>
        <td class="num">${i + 1}</td>
        <td>${escapeHtml(item.customerName)}${
          item.quoteNumber ? `<span class="qno">${escapeHtml(item.quoteNumber)}</span>` : ""
        }</td>
        <td>${RULE_LABEL[item.ruleTriggered] ?? item.ruleTriggered}</td>
        <td class="num">${item.daysSinceSent}</td>
        <td><span class="sev sev-${item.severity}">${SEVERITY_LABEL[item.severity]}</span></td>
        <td class="num value">${formatRand(item.valueCents)}</td>
      </tr>`
    )
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Revenue-at-Risk Audit — ${company}</title>
<style>
  :root {
    --ink:#1B2420; --dim:#565F57; --line:#D8D9CD; --bg:#FFFFFF; --panel:#F5F5EF;
    --accent:#2F6F5E; --gold:#8A6414; --risk:#A23E3E;
    --sans:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
    --serif:Georgia,"Iowan Old Style","Palatino Linotype",serif;
    --mono:ui-monospace,"SF Mono","Cascadia Code","Roboto Mono",monospace;
  }
  * { box-sizing:border-box; }
  body { margin:0; background:var(--bg); color:var(--ink); font-family:var(--sans); line-height:1.55; }
  .sheet { max-width:820px; margin:0 auto; padding:48px 40px 64px; }
  .brand { font-family:var(--mono); font-size:12px; letter-spacing:.14em; text-transform:uppercase; color:var(--accent); font-weight:700; }
  h1 { font-family:var(--serif); font-size:2rem; margin:8px 0 4px; letter-spacing:-.01em; }
  .sub { color:var(--dim); margin:0; }
  .headline { background:var(--panel); border:1px solid var(--line); border-left:5px solid var(--accent); border-radius:8px; padding:26px 28px; margin:32px 0; }
  .headline .label { font-family:var(--mono); font-size:11px; letter-spacing:.1em; text-transform:uppercase; color:var(--dim); margin:0 0 6px; }
  .headline .big { font-family:var(--mono); font-size:2.6rem; font-weight:700; color:var(--accent); font-variant-numeric:tabular-nums; margin:0; }
  .headline .note { color:var(--dim); font-size:.92rem; margin:10px 0 0; }
  .caveat { border-left:3px solid var(--gold); background:#FBF7EC; padding:12px 16px; margin:24px 0; font-size:.92rem; color:#5c4a1a; border-radius:0 6px 6px 0; }
  .stats { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin:24px 0; }
  .stat { border:1px solid var(--line); border-radius:8px; padding:14px 16px; }
  .stat .k { font-family:var(--mono); font-size:11px; text-transform:uppercase; letter-spacing:.05em; color:var(--dim); margin:0 0 4px; }
  .stat .v { font-family:var(--mono); font-size:1.3rem; font-weight:700; font-variant-numeric:tabular-nums; margin:0; }
  h2 { font-family:var(--serif); font-size:1.3rem; margin:36px 0 4px; }
  .h2sub { color:var(--dim); font-size:.9rem; margin:0 0 14px; }
  table { border-collapse:collapse; width:100%; font-size:13.5px; }
  th, td { padding:9px 10px; text-align:left; border-bottom:1px solid var(--line); vertical-align:top; }
  th { font-family:var(--mono); font-size:10.5px; text-transform:uppercase; letter-spacing:.04em; color:var(--dim); background:var(--panel); }
  td.num, th.num { text-align:right; font-family:var(--mono); font-variant-numeric:tabular-nums; }
  td.value { font-weight:700; }
  .qno { display:block; font-family:var(--mono); font-size:11px; color:var(--dim); }
  .sev { font-family:var(--mono); font-size:10.5px; font-weight:700; padding:1px 8px; border-radius:20px; }
  .sev-high { background:#f6e4e2; color:var(--risk); }
  .sev-medium { background:#f4ecd7; color:var(--gold); }
  .sev-low { background:#e2efe9; color:var(--accent); }
  .method { margin-top:40px; padding-top:20px; border-top:1px solid var(--line); font-size:.86rem; color:var(--dim); }
  .method h3 { font-family:var(--mono); font-size:11px; letter-spacing:.08em; text-transform:uppercase; color:var(--ink); margin:0 0 8px; }
  .cta { margin-top:32px; padding:20px 24px; background:var(--accent); color:#fff; border-radius:8px; }
  .cta strong { font-size:1.05rem; }
  .cta p { margin:6px 0 0; opacity:.92; font-size:.92rem; }
  @media print { body { background:#fff; } .sheet { padding:0; max-width:100%; } .cta { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }
</style>
</head>
<body>
<div class="sheet">
  <p class="brand">GrowMatic SA · Revenue-at-Risk Audit</p>
  <h1>${company}</h1>
  <p class="sub">Prepared ${dateStr}${
    options.periodLabel ? ` · based on ${escapeHtml(options.periodLabel)}` : ""
  } · ${audit.importedCount} quotes analysed</p>

  <div class="headline">
    <p class="label">Quoted value with no clear outcome</p>
    <p class="big">${formatRand(audit.revenueAtRiskCents)}</p>
    <p class="note">across ${audit.flaggedCount} quote${
      audit.flaggedCount === 1 ? "" : "s"
    } that were sent but have no recorded result — no logged win, loss, or follow-up outcome.</p>
  </div>

  <div class="caveat">
    <strong>An important honest note:</strong> this figure is <em>not</em> money you are guaranteed to
    recover. It is the value of quotes that have gone dark — where nobody can currently say whether the
    deal is alive, dead, or waiting. The point of the audit is to make that blind spot visible so you can
    decide which of it is worth chasing.
  </div>

  <div class="stats">
    <div class="stat"><p class="k">Quotes analysed</p><p class="v">${audit.importedCount}</p></div>
    <div class="stat"><p class="k">Total quoted value</p><p class="v">${formatRand(
      audit.totalImportedValueCents
    )}</p></div>
    <div class="stat"><p class="k">Flagged for review</p><p class="v">${audit.flaggedCount}</p></div>
  </div>

  <h2>Where the risk sits</h2>
  <p class="h2sub">Two kinds of gap, split by value.</p>
  <table>
    <thead><tr><th>Category</th><th class="num">Quotes</th><th class="num">Value</th></tr></thead>
    <tbody>
      <tr><td>Stale — sent, no follow-up recorded</td><td class="num">${
        audit.staleCount
      }</td><td class="num value">${formatRand(audit.staleValueCents)}</td></tr>
      <tr><td>Older — no recorded outcome at all</td><td class="num">${
        audit.noOutcomeCount
      }</td><td class="num value">${formatRand(audit.noOutcomeValueCents)}</td></tr>
    </tbody>
  </table>

  <h2>Priority recovery queue</h2>
  <p class="h2sub">The highest-value quotes to look at first.${
    remaining > 0 ? ` Showing the top ${shownQueue.length} of ${audit.queue.length}.` : ""
  }</p>
  <table>
    <thead>
      <tr><th class="num">#</th><th>Customer</th><th>Why flagged</th><th class="num">Days</th><th>Priority</th><th class="num">Value</th></tr>
    </thead>
    <tbody>${queueRows}
    </tbody>
  </table>
  ${remaining > 0 ? `<p class="h2sub" style="margin-top:10px">…and ${remaining} more flagged quote${remaining === 1 ? "" : "s"} in the full queue.</p>` : ""}

  <div class="cta">
    <strong>This was a one-time snapshot. The real value is catching the next one.</strong>
    <p>GrowMatic Recover watches your quotes continuously, so a deal never goes dark unnoticed again —
    and shows you, in rand, what was recovered. Reply to talk about a pilot.</p>
  </div>

  <div class="method">
    <h3>How this was calculated</h3>
    <p>We imported ${audit.importedCount} quote${
      audit.importedCount === 1 ? "" : "s"
    } from your own export${
      audit.skippedCount > 0
        ? ` (${audit.skippedCount} row${
            audit.skippedCount === 1 ? "" : "s"
          } could not be read — missing customer, value, or date — and were left out)`
        : ""
    }. A quote is flagged when it is still open, has no recorded outcome, and was sent long enough ago
    to have expected a follow-up. Nothing here is a prediction; it is a factual read of your own data.
    Figures come entirely from the file you provided and are not shared with anyone.</p>
  </div>
</div>
</body>
</html>`;
}
