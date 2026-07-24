# GrowMatic Recover

Import a business's quote history, see the rand value of everything sitting
unresolved, and keep watching so it never goes dark again.

**This is GrowMatic SA's sole focus going forward.** Read
[`docs/STRATEGY.md`](docs/STRATEGY.md) first — it's the durable record of why
this product, why this customer, and what not to build yet. This README is
just about running the code.

## What's actually built right now

- Company sign-up/login (Supabase Auth — one company per account, created
  automatically on sign-up)
- CSV import with AI-assisted column mapping (falls back to plain keyword
  matching if no `ANTHROPIC_API_KEY` is set — never blocks an import)
- The rules engine (`lib/rules-engine.ts`) — fully unit-tested, deterministic,
  zero AI involved: this is the part that decides what's "stale" or has "no
  recorded outcome"
- Revenue-at-risk dashboard, computed live on every page load
- Recovery queue with "Won / Lost" outcome logging, which closes the loop and
  writes an auditable resolution record
- A daily rules-run job (`/api/run-rules`, or `npm run rules:run` locally)
  that persists an audit trail of every exception raised — separate from the
  live dashboard view, which always recomputes fresh

## What's deliberately not built yet

Email ingestion, official WhatsApp integration, Sage/Xero connectors, the
renewals module, billing. Per the plan: don't build these until paying pilots
ask for them by name.

## Setup (about 10 minutes)

1. **Create a free Supabase project** at [supabase.com](https://supabase.com).
2. In the SQL Editor, run **each file in `supabase/migrations/` in order**
   (`0001_init.sql`, then `0002_harden_security.sql`) against your new project.
   `0001` creates the schema; `0002` applies security hardening that the
   Supabase security advisor expects (keeps internal helper functions off the
   public API). After running both, the advisor should report no issues.
3. Copy `.env.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from
     Project Settings → API.
   - `SUPABASE_SERVICE_ROLE_KEY` — same page, the `service_role` secret. Never
     expose this in anything that reaches the browser.
   - `ANTHROPIC_API_KEY` — optional. Without it, column mapping on import
     still works, just via keyword matching instead of Claude.
   - `RULES_ENGINE_SECRET` — make up any password; whatever cron job calls
     `/api/run-rules` must send it back as an `x-cron-secret` header.
4. `npm install`
5. `npm run dev`, then open `http://localhost:3000`, sign up, and try
   uploading a real (or test) quote CSV.

## Try the audit right now, with zero setup

Before touching Supabase at all, you can run the actual "revenue at risk"
audit against a real quote export — this is the 5-minute sales demo tool,
usable on your laptop in front of a prospect:

```bash
npx tsx scripts/preview-import.ts samples/sample-quotes.csv
```

Swap in any real CSV export (Sage, Pastel, Excel — any column headers) to try
it against a real business's data. It prints the same "revenue at risk"
number and prioritised queue the dashboard shows, straight to your terminal.

### Generate a report you can actually send them

The terminal output is for you; the report is for the prospect. Generate a
polished, self-contained HTML report (open in a browser, print to PDF, email
it) — this is the sales artefact Month 1 of the blueprint is built around:

```bash
npx tsx scripts/generate-report.ts their-export.csv "Their Company Name"
```

It writes to `reports/` (gitignored — these contain real customer data and
must never be committed). Every customer-supplied value is HTML-escaped.

## Field materials (for selling, not just building)

- `docs/SALES-PLAYBOOK.md` — the outreach message, the conversation questions,
  how to read real vs polite interest, and the close.
- `docs/templates/prospect-tracker.csv` — a tracker to fill with 60–80 leads.
- `docs/templates/pilot-agreement.md` — a plain-language founding-pilot agreement.
- `docs/templates/privacy-notice.md` — a POPIA privacy notice, honest to how
  the product is actually built.

(The two legal templates are starting points, not legal advice — have them
reviewed before relying on them.)

## Running the tests

```bash
npm run test
```

The rules engine is the one piece of this product that has to never be
wrong, so it's the one piece with real unit tests. Read
`lib/rules-engine.test.ts` before changing any threshold in
`lib/rules-engine.ts` — it documents exactly what "stale" and "no recorded
outcome" are supposed to mean.

## Running the daily rules check

The daily job re-checks every open quote and persists an exceptions
audit-trail row for anything newly gone stale. Trigger it:

- **On Vercel (production):** already scheduled in `vercel.json` to run daily
  at 04:00 UTC (06:00 SAST). For it to run, two environment variables must be
  set in the Vercel project:
  - `CRON_SECRET` — any long random string. Vercel automatically sends it as
    `Authorization: Bearer <CRON_SECRET>` on the scheduled call, and the
    endpoint checks it.
  - `SUPABASE_SERVICE_ROLE_KEY` — the job reads across all tenants, so it needs
    the service-role key (from Supabase → Project Settings → API).
- **Manually, locally:** `npm run rules:run` (uses `.env.local`).
- **Any other scheduler:** `POST`/`GET` to `/api/run-rules` with header
  `x-cron-secret: <RULES_ENGINE_SECRET>`.

## Deploying

- **Frontend + API routes:** Vercel or Railway both work with zero config
  changes — this is a standard Next.js app.
- **Database:** Supabase, already set up above.
- **Payments:** not wired up yet — add Paystack or PayFast once you have a
  paying pilot to bill.

## Folder structure

```
app/
  page.tsx                → marketing landing page
  login/                  → sign in / sign up
  dashboard/              → the revenue-at-risk number
  upload/                 → CSV import + column mapping UI
  queue/                  → full recovery queue, outcome logging
  api/
    upload/                 → insert mapped rows
    upload/map/             → AI (or heuristic) column-mapping suggestion
    quotes/[id]/resolve/    → log Won/Lost, closes the audit-trail exception
    run-rules/              → the daily job, cron-triggered
lib/
  rules-engine.ts         → the core detection logic (pure, tested)
  rules-engine.test.ts
  audit.ts, audit.test.ts  → the shared audit: CSV rows → structured result,
                             used by both the terminal preview and the report
  reportHtml.ts            → renders the emailable customer-facing HTML report
  runRulesEngine.ts        → wires the rules engine to the database
  ai/mapColumns.ts        → Claude-assisted column mapping, with fallback
  import.ts, import.test.ts → turns one raw CSV row into a quote record
  data.ts, types.ts        → typed reads from Supabase
  supabase/                → browser/server/service-role Supabase clients
  money.ts, money.test.ts  → rand formatting/parsing (handles both
                             "20,000.50" and Sage/Pastel-style "20 000,50")
supabase/migrations/       → the whole database schema, including row-level
                             security so each company only ever sees its own data
samples/sample-quotes.csv  → a deliberately messy realistic quote export,
                             for testing the import flow and the demo tool below
scripts/
  run-rules-engine.ts      → CLI entry point for the daily job
  preview-import.ts        → audit a CSV to the terminal, zero setup
  generate-report.ts       → audit a CSV into an emailable HTML report
docs/
  STRATEGY.md              → the durable product decision and scope
  90-DAY-BLUEPRINT.md      → the week-by-week execution plan
  SALES-PLAYBOOK.md        → outreach, conversation, and closing scripts
  templates/               → pilot agreement, privacy notice, prospect tracker
proxy.ts                   → session refresh + auth redirect (this Next.js
                              version renamed `middleware.ts` to `proxy.ts`)
```
