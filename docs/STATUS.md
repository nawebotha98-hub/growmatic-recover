# Status snapshot

Last updated: 24 July 2026. Read this first when resuming — it's the "where
did we leave off" file. `STRATEGY.md` and `90-DAY-BLUEPRINT.md` are the
stable references; this one gets overwritten as things change.

## What's live right now

- **Product:** [growmatic-recover.vercel.app](https://growmatic-recover.vercel.app) — deployed, working, verified end to end (signed up, imported `samples/sample-quotes.csv`, dashboard correctly showed R1,347,251 at risk across 7 quotes — matching the CLI tool and the report generator exactly).
- **Database:** Supabase project `osnvcheogxxmuircrfaq` (London region) — schema applied, security-hardened (advisor reports zero issues), RLS verified with real cross-tenant tests.
- **Repo:** [github.com/nawebotha98-hub/growmatic-recover](https://github.com/nawebotha98-hub/growmatic-recover), `main` branch, fully up to date.
- **Daily job:** Scheduled via Vercel Cron (`vercel.json`, 04:00 UTC / 06:00 SAST) but **not yet fully wired** — needs `CRON_SECRET` and `SUPABASE_SERVICE_ROLE_KEY` added in Vercel's environment variables before it'll actually run (currently a no-op safely, not broken).

## What's NOT done yet

- Zero real customer conversations.
- No company registration (CIPC), no business bank account.
- No privacy policy / pilot agreement actually sent to anyone (templates exist in `docs/templates/`).
- `growmaticsa.com` (the old site) untouched, on purpose — revisit once there's a real pilot to show.

## Immediate next action

Month 1, Week 1 of `docs/90-DAY-BLUEPRINT.md`: build the 60–80 company
prospect list and send the first 20 outreach messages. Nothing technical is
blocking this — it's the first sales action.

## Known one-off gotcha (already fixed, noting for memory)

Vercel's `NEXT_PUBLIC_SUPABASE_URL` was originally mistyped as `supabse.co`
(missing an "a") when pasted into the dashboard — caused a silent
`NetworkError` on sign-up. Fixed by editing the value directly and
redeploying. If a *different* NetworkError ever shows up again, check the
env var values first before assuming it's a code bug.
