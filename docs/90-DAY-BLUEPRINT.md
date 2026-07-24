# GrowMatic Recover — the 90-day blueprint

A week-by-week plan for the next 3 months, a full audit of where things stand,
what to learn (and when), and a risk checklist. Read `docs/STRATEGY.md` first
if you haven't — this document assumes that decision is locked and is about
execution, not strategy.

## 0. Full audit — where things actually stand today

**Done and verified:**
- Product decision locked and researched (15 ideas scored against real SA competitors)
- GrowMatic Recover built: import, rules engine, dashboard, recovery queue, outcome logging
- 32 automated tests passing; schema and row-level security tested against a
  real local Postgres, not assumed — cross-tenant isolation, spoofed
  `company_id` inserts, and the duplicate-exception constraint all verified
- A zero-setup demo tool (`scripts/preview-import.ts`) that already produced
  a correct R1.3m "revenue at risk" result on sample data
- Code pushed to `nawebotha98-hub/growmatic-recover`; strategy captured in `docs/STRATEGY.md`

**Not done yet — the real gaps:**
- No Supabase project connected — the app has never run against a live database
- Zero customer conversations had
- No company legally registered, no business bank account, no contract/ToS for a paying pilot
- No deployed, public URL for the app
- No privacy policy / data-processing terms for handling a customer's financial data

**Resources on hand:** ~R10,000 capital, evenings/weekends around a 9–5,
ability to sell face-to-face in Gqeberha, Claude Code + this codebase.

## 1. The one-page mental model

**What we do:** import a trades business's quote history, tell the owner —
in rand — exactly how much is sitting unresolved, then keep watching. Never
replace their CRM/Sage/WhatsApp/Excel; sit alongside all of it.

**Who for:** SA solar, security/CCTV/access-control, gate-automation, and
commercial HVAC companies, 5–50 staff, 30+ quotes/month, R15k–R500k quote
values. Starting in Gqeberha.

**Why it works when "AI automation" doesn't:** the pitch is never "we use
AI" — it's a rand number about their own business they didn't know. Unarguable
in a way a chatbot demo isn't.

**The day-to-day loop:** Find a prospect → real conversation, no pitch → get
their export, run the audit → the number IS the demo → founding pilot (R3,500
+ R1,800/mo) → log real outcomes, show recovered revenue monthly → ask for a referral → repeat.

**The one number to watch every week:** real conversations had. Not revenue —
that lags. If it's zero this week, nothing else here matters this week.

## 2. Month 1 — Prove the pain is real
**Target: 2 pilots signed, R0–7,000 banked**

| Week | Focus | Actions | Target by Friday |
|---|---|---|---|
| 1 | Set the stage | Build a 60–80 company prospect list (Google Maps + PV GreenCard + PSIRA, Gqeberha/Eastern Cape). Send the WhatsApp opener to the first 20. Create your Supabase project (10 min) and click through the app yourself. | 20 messages sent, 3+ replies, app running locally |
| 2 | First conversations | Run 8–10 real conversations using the validation questions. Ask directly for a quote export from anyone who admits the pain. Start company registration (CIPC) now — don't let it become a later bottleneck. | 3 real quote exports in hand |
| 3 | Run the audits | Run `preview-import.ts` against each real export. Send each owner their own report. Get 2 more exports. Reach 20–30 total conversations. | 5 exports audited, 2+ "how do we keep this running" reactions |
| 4 | Close the pilots | In the same call, ask directly for the founding pilot. Don't build anything further until someone says yes. Open a business bank account once registration clears. | 2 founding pilots signed and paid |

**Kill/pivot signal:** fewer than 5 of 20–30 contacted businesses will share
real data → the pain isn't provable enough as pitched. Revisit debtor/AR
follow-up or the automotive-workshop angle before building further.

## 3. Month 2 — Get pilots actually using the product
**Target: 4–6 customers, R15,000–25,000 cumulative**

| Week | Focus | Actions | Target by Friday |
|---|---|---|---|
| 5 | Go live | Deploy (Vercel or Railway). Onboard pilots 1 and 2 directly — upload their first CSV together on a call. | App live at a real URL, 2 pilots onboarded |
| 6 | Watch, don't assume | Check in: what do they click, what confuses them, what do they ask for? Resist adding anything not requested twice. | A short list of real, requested features |
| 7 | Build the top request | Ship the single most-requested item only. | One real feature shipped, tested |
| 8 | Expand with proof | Use pilot 1's real result as your opening line with 10 new prospects. Set up recurring billing (Paystack/PayFast). | 2–4 new customers, first recurring payment collected |

## 4. Month 3 — Make the sales motion repeatable
**Target: 8–10 customers, R45,000–65,000 cumulative**

| Week | Focus | Actions | Target by Friday |
|---|---|---|---|
| 9 | Standardise | Write down your onboarding checklist and refined pitch script. | A repeatable, written playbook |
| 10 | Widen the net | Keep going in solar if pipeline is strong, or open security/CCTV/HVAC using the same playbook. | Pipeline of 15+ live prospects |
| 11 | Tighten operations | Simple bookkeeping (spreadsheet is fine): cumulative revenue, MRR, per-customer cost. Write a one-page privacy policy / data terms. | Financials tracked, ToS/privacy live |
| 12 | Push to target | Close remaining pipeline to reach 8–10 customers. Ask every customer for one referral. | 8–10 paying customers |
| 13 | Honest review | Tally cumulative revenue, MRR, churn, time spent. Decide, with real numbers, whether months 4–6 accelerate, hold, or adjust. | A written go/no-go decision |

## 5. What to know, learn, and understand — and when

**Legal & company basics (month 1, week 2–3):**
- CIPC Pty Ltd registration: R125–500, days to two weeks. Start in week 2. A
  sole-proprietor invoice under your own name is fine for the first payment
  if registration is still pending.
- Business bank account once the Pty Ltd exists.
- POPIA: the technical safeguards are already built (tenant isolation,
  encryption). Still needed — a one-page privacy policy and a
  data-processing clause in the pilot agreement, before month 2's real usage.
- A one-page pilot agreement: what you deliver, what they pay, how either
  side can end it. Clarity over legal polish at this stage.

**SaaS fundamentals (month 2, once billing starts):**
- Track MRR, ARPU, churn, gross margin weekly in a simple spreadsheet.
- Churn matters more than growth right now — ten customers who stay beats
  twenty who half-churn.

**Industry knowledge (ongoing, absorbed through conversations, not a reading list):**
- Solar: enquiry → site visit → quote → revision → deposit → install →
  commissioning; "PV GreenCard" signals a quality-conscious installer.
- Security: PSIRA registration is table stakes for legitimacy.
- The month-1 conversations *are* the education — don't front-load research here.

**Sales skills (needed immediately):**
- Discovery before pitching — the validation questions exist so you learn
  their process before proposing anything.
- Recognise the polite no: "sounds interesting" with no data shared is a no.
- Ask for the close directly, in the same call as the report.

**Technical literacy (ongoing, just-in-time):**
- Understand row-level security / multi-tenancy conceptually — enough to
  answer "can another company see my data?" with a real answer.
- When something breaks or confuses you, ask specifically about that piece
  rather than trying to learn the whole stack upfront.

**The one rule across all of it:** if a piece of research doesn't change what
you do *this week*, it was entertainment, not preparation.

## 6. Full risk audit

| Risk | Why it matters | Mitigation |
|---|---|---|
| False positives erode trust | If "at risk" is wrong/overstated, the pitch collapses on contact | Thresholds conservative and tested; report never claims stale value is automatically recoverable |
| Mishandling customer financial data | Now trusted with real quotes, names, values | RLS tested and verified; still need privacy policy + pilot agreement before month 2 |
| No contract in place | Taking payment with no written agreement is a real exposure | Write the one-page pilot agreement in month 1, week 4 |
| Founder burnout | Full-time job + unlimited onboarding calls isn't sustainable | Hard weekly cap on conversations/onboarding; protect "watch, don't build" in month 2 |
| The pain isn't real enough | Businesses may have stale quotes but not value monitoring them monthly | Respect the month-1 kill criteria if triggered |
| Spending the R10,000 wrong | Designed to be low-capital; misspending removes your margin for error | ~R500 registration, ~R500/yr domain, free-tier Supabase/Vercel, a few hundred rand of Claude API. Most of the R10,000 should stay unspent through month 3. |
| A competitor undercuts on price | BizAI exists at R599/month for a different category | Never let the pitch be compared to a CRM — lead with the rand number, never "AI" or "software" |

## 7. Success criteria — what "it worked" means at day 90

- [ ] 8–10 paying customers, not just signed-up trials
- [ ] R45,000–65,000 cumulative revenue banked
- [ ] At least 3 customers who could point to a real rand amount recovered
- [ ] A written, repeatable onboarding checklist and pitch script
- [ ] Company registered, bank account open, privacy policy and pilot agreement in place
- [ ] A clear, numbers-backed answer to "accelerate, hold, or pivot" for months 4–6

Falling short of the revenue number but hitting the qualitative bar (real
customers, real trust, real repeatable process) is still real progress.
Hitting a revenue number by luck while missing the qualitative bar is not.
