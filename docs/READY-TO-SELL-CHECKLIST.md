# Ready-to-sell checklist

Everything that needs to be true before GrowMatic Recover can take a real,
paying customer — grouped by category, with what's already done marked.
Cross-check this whenever it's unclear "are we actually ready yet."

## Product — done

- [x] Live, deployed app (growmatic-recover.vercel.app)
- [x] Database schema, security-hardened, RLS verified with real tests
- [x] CSV import + column mapping (AI-assisted, degrades gracefully without a key)
- [x] Revenue-at-risk dashboard, recovery queue, outcome logging
- [x] Zero-setup demo tool (`preview-import.ts`) and customer report generator
  (`generate-report.ts`) — both verified against a real messy sample file
- [x] End-to-end verified live: signed up, imported data, dashboard showed the
  correct number

## Product — not blocking, but should close soon

- [ ] Daily Vercel Cron job actually running — needs `CRON_SECRET` and
  `SUPABASE_SERVICE_ROLE_KEY` added in Vercel's environment variables
  (currently scheduled but silently no-ops without them; doesn't block a demo
  or a first pilot's onboarding, but should be live before "ongoing
  monitoring" is actually true for a paying customer)

## Sales materials — done

- [x] Sales playbook: outreach message, conversation questions, close script
  (`docs/SALES-PLAYBOOK.md`)
- [x] Report generator that turns a real export into a sendable PDF/HTML
- [x] Starter prospect list — 20 real, sourced Gqeberha-area companies across
  all four verticals (`docs/templates/prospect-tracker.csv`)

## Sales materials — not done

- [ ] Prospect list expanded to 60–80 (20 real leads are a start, not the
  full list — add more via Google Maps searches, PV GreenCard, PSIRA)
- [ ] First outreach messages actually sent (zero sent so far)

## Legal & financial — not done, needed before accepting money

- [ ] Pilot agreement reviewed and finalised (template exists at
  `docs/templates/pilot-agreement.md` — get it looked over, then it's ready to sign)
- [ ] Privacy notice reviewed and finalised (template exists at
  `docs/templates/privacy-notice.md`)
- [ ] A way to receive payment for the first pilot — a personal or business
  EFT account is enough to start; Paystack/PayFast recurring billing can wait
  until month 2 per the blueprint
- [ ] Company registration (CIPC, Pty Ltd) — can run in parallel, doesn't
  block the first conversations or even the first invoice (a sole-proprietor
  invoice under your own name is fine while registration is pending)

## The actual bar to clear before customer #1

You do **not** need every box above ticked to start selling. You need, at
minimum:
1. The prospect list (expand it)
2. Outreach sent
3. A real quote export from someone who admits the pain
4. The report generated and shown to them
5. The pilot agreement reviewed enough that you're comfortable having someone
   sign it, and a bank account to receive R3,500 into

Everything else on this list (full CIPC registration, the daily cron,
Paystack) can catch up in parallel or in month 2 — none of it blocks the
first sale.
