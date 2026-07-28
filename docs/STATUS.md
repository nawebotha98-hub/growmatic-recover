# Status snapshot

Last updated: 28 July 2026, after a full systems check across every repo,
Supabase, Vercel, Railway, and GitHub Pages — not just a code review, actual
live verification (queried the production database, pulled Railway runtime
logs, checked Vercel deploy state, confirmed GitHub Actions runs). Read this
first when resuming. `STRATEGY.md` and `90-DAY-BLUEPRINT.md` are the stable
references; this one gets overwritten as things change.

## Systems check results (28 July)

| System | Status | Evidence |
|---|---|---|
| Product app (Vercel) | ✅ Live, deploy READY | Latest deploy matches latest commit (`4fa816c`), zero runtime errors in the last 7 days |
| Database (Supabase) | ✅ Healthy | `ACTIVE_HEALTHY`, RLS enabled on all 5 tables, only minor advisory notices (see below) |
| WhatsApp/email backend (Railway) | ✅ Running clean | Boot self-test passed, daily briefing sent this morning (05:08 UTC), email assistant correctly filtering its own/bulk mail, no errors in logs |
| Website (GitHub Pages) | ✅ Live, current | Last 5 deploys all `success`, matches every commit through this session |
| **Daily rules-engine cron** | ❌ **Still not actually running** | See below — this is the one real gap |

### The one real gap: the daily job has never run

`vercel.json` schedules `/api/run-rules` daily, but it needs a `CRON_SECRET`
and `SUPABASE_SERVICE_ROLE_KEY` set as **Vercel project environment
variables** (Vercel's dashboard, not `.env.local` — that file never leaves
your machine). This was flagged as an open item on 24 July and is *still*
open: queried the live database directly and `exceptions` has **0 rows**
despite quotes like Wesbank Body Corporate (R412,000, open, sent 8 June —
50 days ago) that unambiguously should be flagged. The job has been safely
no-op-ing every night since day one, not erroring, which is why nothing
looked obviously broken.

**The fix (5 minutes, needs to happen in the Vercel dashboard — I can't set
env vars myself):**
1. Vercel → growmatic-recover project → Settings → Environment Variables
2. Add `CRON_SECRET` = any random string (e.g. generate one with `openssl rand -hex 32`)
3. Add `SUPABASE_SERVICE_ROLE_KEY` = the service role key from Supabase →
   Project Settings → API (**never** the anon key — this one bypasses RLS,
   keep it out of chat/screenshots)
4. Redeploy (or just wait for the next daily run at 04:00 UTC)

Once that's done, this is genuinely finished — the code, schema, and RLS are
already verified correct.

## What's done

**Product (GrowMatic Recover):**
- Live app, real branding (logo, not placeholder text), signup → CSV import
  → dashboard verified end-to-end with real data
- Revenue-at-risk dashboard, recovery queue, outcome logging
- Rules engine: 39 tests passing, thresholds fixed and locked (R100k/R50k,
  not the original 10x-too-low R10k/R5k bug caught mid-session)
- Security-hardened DB: advisor-clean, RLS tested with real cross-tenant
  attempts, signup trigger isolates each company correctly
- Zero-setup demo tool + customer-facing report generator, both verified
  against a messy real-world sample export

**Website (growmaticsa.com):**
- Rebuilt around Quote Recovery exclusively (no more generic "AI agency"
  positioning anywhere on it)
- Hero redesigned this week: dark editorial composition, real dashboard
  preview (not a generic phone mockup), self-hosted fonts (was silently
  falling back to a system font for some visitors — fixed), fixed a
  chat-widget overlap bug, fixed invisible text and accent contrast
- GitHub Pages deploy pipeline confirmed healthy, custom domain (CNAME)
  correctly pointed here
- The competing `growmaticsa-com` (Lovable) repo's auto-deploy is disabled
  (manual dispatch only) and has no CNAME file, so it shouldn't be able to
  contend for the domain — **one manual check still worth doing**: confirm
  Settings → Pages → Custom domain is actually cleared on that repo, since
  that field lives outside what I can verify via API

**Backend (shared, Railway):**
- Email auto-reply (`growmaticsa@gmail.com` via Cloudflare routing → Resend)
  running clean, self-test passing on every boot
- WhatsApp assistant ("Matt") and site chat rewritten to describe Quote
  Recovery correctly — no more "AI automation agency" framing, no more
  "this chat is a demo" framing
- Daily briefing + weekly backup jobs both firing on schedule

## What's NOT done yet

- **The cron env vars above** — the only thing standing between "built" and
  "actually monitoring quotes daily" for a real customer
- Prospect list is at 27 real, sourced companies (`docs/templates/
  prospect-tracker.csv`) — the 90-day blueprint calls for 60–80
- **Zero outreach messages sent.** Zero real customer conversations.
- Found during this check: `growmaticsa-com`'s `leads/` folder has 41
  prospects and 33 Gmail drafts already written and ready to send — but
  they're from *before* the Quote Recovery pivot (generic "automated
  enquiry/booking assistant" pitch, aimed at architects, interior
  designers, painters, wedding/event planners — not solar/security/
  gate-automation/HVAC). **Don't send these as-is** — wrong pitch, wrong
  audience for the current product. The infrastructure (Gmail draft
  creation, tracker format) could be reused for real Quote Recovery
  outreach, but the messaging would need to be rewritten and the targets
  would need to come from `prospect-tracker.csv`, not that list.
- No company registration (CIPC), no dedicated business bank account
- No pilot agreement / privacy notice actually sent to anyone (templates
  exist, need review not creation)
- The separate Supabase project behind `growmaticsa-com`'s old
  `site_content`/`kb_documents` tables remains unverified — no MCP
  connection to that project from this session, network egress blocked to
  test directly. Low priority since that repo isn't the live site.

## The actual bar to clear before customer #1 (unchanged from the checklist)

1. Fix the cron env vars (5 minutes, unblocks "ongoing monitoring" being true)
2. Expand the prospect list
3. Send outreach — get one real quote export from someone who admits the pain
4. Generate the report, show them their own number
5. Pilot agreement reviewed enough to be comfortable signing, and a bank
   account to receive R3,500 into

Everything else (CIPC, Paystack, the 33 stale drafts) can catch up later —
none of it blocks the first sale.

## Immediate next action

Fix the two Vercel env vars (above), then Month 1 Week 1 of
`90-DAY-BLUEPRINT.md`: expand the prospect list to 60-80 and send the first
20 real outreach messages. Nothing technical is blocking sales action.

## Known one-off gotchas (already fixed, noting for memory)

- Vercel's `NEXT_PUBLIC_SUPABASE_URL` was originally mistyped as
  `supabse.co` (missing an "a") — caused a silent `NetworkError` on sign-up.
  Fixed by editing the value directly and redeploying.
- The website's Google Fonts link was failing to load for at least one real
  visitor (screenshot showed the headline in a fallback system font) —
  fonts are now self-hosted in `assets/fonts/` in the `growmatic-sa` repo,
  removing the external dependency entirely.
