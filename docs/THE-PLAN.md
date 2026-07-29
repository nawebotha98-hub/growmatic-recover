# GrowMatic Recover — the plan (read this one file)

Everything done, everything left, the next 30 days, and the honest path
to R50,000/month. Written 28 July 2026. This is the one file to read;
`docs/STATUS.md`, `STRATEGY.md`, `MARKET-VALIDATION.md`,
`90-DAY-BLUEPRINT.md`, `SALES-PLAYBOOK.md`, and
`READY-TO-SELL-CHECKLIST.md` have the full detail behind each section
below if you want to go deeper on any one part.

---

## Part 1 — Everything that's done

**The product works and is verified, not just built:**
- Live at growmatic-recover.vercel.app — signup → CSV import → dashboard
  verified end-to-end with real data
- Revenue-at-risk dashboard, recovery queue, outcome logging, CSV import
  with AI-assisted column mapping
- Rules engine: 39 automated tests passing, thresholds fixed and locked
  (a real 10x bug was caught and fixed mid-build — R100k/R50k, not the
  original R10k/R5k)
- Database: Supabase, schema applied, security-hardened (advisor-clean),
  row-level security tested with real cross-tenant attempts, not assumed
- Real branding: your actual logo, not a placeholder
- Zero-setup demo tool + customer-facing report generator, both verified
  against a messy real-world sample export

**The website is rebuilt around this product specifically:**
- growmaticsa.com now pitches Quote Recovery exclusively — no leftover
  "AI automation agency" positioning anywhere
- Hero redesigned this week for a premium look: dark editorial
  composition, a real dashboard preview instead of a generic phone mockup,
  self-hosted fonts (was silently breaking for some visitors), a fixed
  chat-widget bug, fixed contrast issues, a subtle floating animation
- GitHub Pages deploy confirmed healthy; the competing Lovable-built
  repo's auto-deploy is disabled so it can't fight for the domain

**The backend is real and running clean:**
- WhatsApp assistant ("Matt"), email auto-reply, and site chat all
  rewritten to describe Quote Recovery correctly (no more "AI agency" or
  "this chat is a demo" framing)
- Daily briefing and weekly backup jobs firing on schedule, verified via
  live Railway logs, zero errors

**The business groundwork:**
- Market validated with real research, not just internal reasoning: the
  "quotes go cold, nobody follows up" pain point is well-documented
  globally and in South Africa specifically; the four target verticals
  (solar, security, gate-automation, HVAC) represent a plausible market of
  several thousand SA businesses (full detail: `MARKET-VALIDATION.md`)
- Competitive landscape mapped honestly, including competitors closer and
  cheaper than first realized (ClientPulse specifically) — the
  differentiator that survives that is the free retrospective audit
  ("show me my number before I ask for anything"), not the software itself
- Sales playbook, pilot agreement template, privacy notice template, and a
  starter prospect list of 27 real, sourced Gqeberha-area companies all
  written
- Standing authorization set up so routine technical work (bug fixes,
  maintenance, health checks) happens without a round-trip every time,
  plus a daily automated systems check

## Part 2 — Everything still to do

**One technical gap, blocking "the product actually watches quotes daily":**
- [ ] Add `CRON_SECRET` and `SUPABASE_SERVICE_ROLE_KEY` in Vercel's
  environment variables (you said you'll do this from your PC — the daily
  job has been silently doing nothing since launch without it; confirmed
  by querying the live database directly, not guessed)

**Everything else left is sales, not building:**
- [ ] Prospect list expanded from 27 to 60–80 real companies
- [ ] First outreach messages sent — **zero sent so far**
- [ ] Zero real customer conversations had
- [ ] Pilot agreement + privacy notice reviewed enough to be comfortable
  using them (templates exist, need your read-through, not creation)
- [ ] A way to receive payment for the first pilot (a personal or business
  EFT account is enough to start)
- [ ] Company registration (CIPC) — can run in parallel, doesn't block the
  first conversation or even the first invoice

**The actual bar to clear before customer #1**, in order: prospect list →
outreach sent → one real quote export from someone who admits the pain →
the report generated and shown to them → pilot agreement you're
comfortable having someone sign → a bank account to receive R3,500 into.
Nothing else on the list above blocks that.

## Part 3 — The next 30 days

| Week | Focus | Do this | You'll know it worked when |
|---|---|---|---|
| **1** | Set the stage | Fix the two Vercel env vars. Expand the prospect list to 60–80 (Google Maps, PV GreenCard, PSIRA, SAEFIA directories). Send the WhatsApp opener from `SALES-PLAYBOOK.md` to the first 20. | Cron confirmed running (exceptions table starts populating); 20 messages sent, 3+ replies |
| **2** | First real conversations | Run 8–10 conversations using the validation questions in `SALES-PLAYBOOK.md` — discovery before pitching. Ask directly for a quote export from anyone who admits the pain. Start CIPC registration now so it isn't a later bottleneck. | 3 real quote exports in hand |
| **3** | Run the audits | Generate a real report for each export (`scripts/generate-report.ts`). Send each owner their own number — the report *is* the demo. Get 2 more exports. Reach 20–30 total conversations. | 5 exports audited; at least 2 "how do we keep this running" reactions |
| **4** | Close the first pilots | In the same call as the report, ask directly for the Founding Pilot (R3,500 + R1,800/mo). Don't build anything further until someone says yes. Open a business bank account once registration clears. | 2 founding pilots signed and paid |

**The single number that matters most this month: real conversations had.**
Not revenue, not messages sent — actual conversations. If that number is
zero in a given week, nothing else here matters that week.

**Kill/pivot signal**: if fewer than 5 of the first 20–30 businesses
contacted will share real data, the pain isn't provable enough as pitched
— that's the point to revisit the plan, not push harder on the same
message.

## Part 4 — The honest path to R50,000/month

**Straight math first**: R50,000/month at R1,800/month per customer is
**28 paying customers** on the recurring plan. That's the real target
number — not a vague "get big," an actual headcount.

**The honest timeline — read this part carefully.** Reaching 28 customers
in 30 days, from zero customers and zero outreach sent today, is not
realistic, and I'd be doing you a disservice pretending otherwise.
`STRATEGY.md` already set this expectation honestly before today: R50,000
in **cumulative** revenue by month 6 is the real target; R50,000 in
**monthly recurring** revenue is realistically a **month 9–12** outcome
for a single, part-time founder doing high-touch, in-person-style sales
into small businesses that don't already trust you. The 30-day plan above
is step one of that path, not a plan to hit R50k this month.

Here's the credible glide path, extending the existing 90-day blueprint
forward with the same pace and the same assumptions (no assumption of
things getting easier than they've been so far — if anything, referrals
should make each customer somewhat cheaper to land than the last):

| Month | New customers this month | Total customers | MRR run-rate |
|---|---|---|---|
| 1 | 2 | 2 | R3,600 |
| 2 | 3 | 5 | R9,000 |
| 3 | 3–4 | 8–9 | R14,400–16,200 |
| 6 | ~3/month average | ~17–18 | R30,600–32,400 |
| 9 | ~3–4/month average | ~26–30 | **R46,800–54,000** |

R50,000 MRR lands around **month 9**, not day 30 — assuming the pace of
the first 90 days roughly holds, which is itself not guaranteed; it could
go faster (referrals compound, word-of-mouth in a tight local industry)
or slower (the kill/pivot signal above triggers, or conversion is harder
than expected). This is a credible estimate built from the actual plan,
not a promise.

**What would actually move this faster than the table above:**
- Referrals reduce cost-per-customer over time — ask every paying
  customer for one introduction, every time, without exception
- A second vertical (security, gate-automation, or HVAC) opened once
  solar's playbook is proven and repeatable, roughly month 3–4
- Real case studies ("we recovered R180,000 for a Gqeberha solar
  installer") make every subsequent pitch faster to close than the last

**What would slow it down, and is worth watching for honestly:**
- Fewer than 1-in-4 real conversations leading to a shared quote export
- Customers who churn after the founding pilot rather than renewing
- The R1,800/month price meeting real resistance against ClientPulse
  (R1,100/month) in actual conversations, not hypothetically

## The one thing to do before anything else

Fix the two Vercel env vars, then send the first 20 messages this week.
Everything above is sequenced from that starting point — nothing on this
whole plan moves until that happens.
