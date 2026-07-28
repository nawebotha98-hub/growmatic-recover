# GrowMatic SA — strategy reference

**Status: this is the company now.** GrowMatic SA's focus, singular, is GrowMatic
Recover. This document exists so the reasoning behind that decision survives
independently of any chat history — reread it whenever the plan feels fuzzy,
before considering a pivot, and before adding anything not in the MVP scope
below.

## The one-sentence version

GrowMatic Recover imports a trades business's existing quotes and enquiries,
shows the owner the rand value of opportunities nobody followed up on, and
keeps watching — without replacing whatever CRM, WhatsApp, email, or
accounting system they already use.

## Why this, specifically, and not a generic AI product

This was chosen after scoring 15 distinct South African B2B bottlenecks
against real competitor research, not brainstormed and picked because it
sounded good. Two things ruled out the "AI bot" framing on purpose:

- **A cheap, funded local competitor (BizAI, R599/month) already sells "AI
  CRM with WhatsApp + Sage" to the same buyer.** Competing there on price or
  features is a losing game. This product must never be pitched or perceived
  as a CRM or a chatbot — it sits *alongside* whatever the customer already
  uses and answers a question none of those tools answer: total exposure,
  and what needs attention right now.
- **"Selling AI" is not a business.** The pitch is a rand number about the
  customer's own business, not a technology. AI (Claude) is used narrowly —
  interpreting messy customer replies — never as the headline.

## Who it's for (do not drift from this)

South African solar, security/CCTV/access-control, gate-automation, and
commercial HVAC/refrigeration companies — 5–50 staff, 30+ quotes a month,
average quote value R15,000–R500,000, communicating through a mix of
WhatsApp, email, and Excel/Sage/Pastel. Not "SMEs" in general.

## Pricing

- Founding audit + pilot: R3,500 once-off + R1,800/month
- Starter: R1,800/mo · Growth: R3,200/mo · Pro: R5,500+/mo (adds official
  WhatsApp, renewals module, multi-branch)

## What "done" looks like at each stage (do not build ahead of this)

**Must have (built):** company login, CSV import with column mapping,
staleness/no-outcome detection, revenue-at-risk dashboard, recovery queue,
outcome logging.

**Build later — only once customers ask for it by name:** email ingestion,
official WhatsApp Business Platform integration, direct Sage/Xero connectors,
the renewals/warranty module, billing, and Payment Recovery (chasing unpaid
invoices post-job — already Stage 3 of the public roadmap on the website;
a business-model canvas for it was proposed 28 July 2026 and is worth
revisiting *when this stage is actually next*, not before — see the note
in that day's conversation. Same rule applies: not until Quote Recovery has
a real paying customer).

**Do not build yet, full stop:** a CRM or field-service-management
replacement, bank reconciliation, inventory, technician scheduling/GPS, any
autonomous outbound messaging.

## The moat (so nobody adds a "clone this" feature and worries)

Not the code — a competent developer with Claude Code could rebuild the CSV
importer and dashboard in two weeks. The moat is: the imported quote history
and logged outcomes (compounding per customer), vertical-tuned staleness
rules, sitting across whatever system-of-record a customer runs (survives
them switching CRMs), and being the trusted name in the room for the next 20
prospects in Gqeberha.

## Founder operating rule

Concierge first. Manually run the audit for the first pilots by hand
(spreadsheet + Claude) before building anything further. Sell the outcome
before automating everything. R50,000 cumulative revenue in 6 months is the
real target; R50,000 MRR by month 6 is not — that's realistically a month
9–12 outcome, and treating it otherwise is how founders talk themselves into
quitting a plan that was actually working.

## Market validation (added 28 July 2026)

A fresh research pass — real web research, not just reasoning — confirmed
the pain point and market size are real, but surfaced closer competitors
than BizAI alone (ClientPulse specifically, at R1,100/mo, undercutting and
out-featuring the current price). Full detail, sources, and the
recommendation in `docs/MARKET-VALIDATION.md`. Short version: keep going,
don't pivot, but the pitch must stay a pre-signup diagnostic ("show me my
number") and never drift into being perceived as quote-tracking software,
because several competitors already sell that, some cheaper.

## Full research and 15-idea comparison

The complete market research, competitor analysis, scoring of all 15
opportunities considered, unit economics, and 6-month execution plan were
produced as a strategy memo alongside this codebase. If that document isn't
attached to this repo, ask for it to be regenerated from this summary rather
than re-deriving the decision from scratch — the reasoning above is the
distilled version of it.
