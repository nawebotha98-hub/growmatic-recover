# GrowMatic Recover — sales playbook

The field manual for Month 1. Everything you need to go from a name on a list
to a signed pilot. Keep this open during outreach week.

## The golden rule

You are never selling software. You are having a conversation about a specific
problem — quotes that go dark — and then showing a number. The number sells.
The moment you sound like you're pitching "AI" or "a system", you've lost.

## Step 1 — Build the prospect list

Fill `docs/templates/prospect-tracker.csv` with 60–80 companies. Where to find them:

- **Google Maps:** search "solar installers Gqeberha", "CCTV security Port
  Elizabeth", "gate automation Eastern Cape", "air conditioning Gqeberha".
  Grab the business name, phone, and whether they have a website.
- **PV GreenCard directory** (pvgreencard.co.za) — quality-conscious solar installers.
- **PSIRA** — registered security businesses.
- **LinkedIn** — search the above + "owner" / "managing director" for a name.

Aim for companies that clearly do real installation work (not one-person
operations, not giant nationals). The sweet spot is 5–50 staff.

## Step 2 — The first message

Send by WhatsApp where you have a mobile number, email otherwise. Keep it
short, human, and about them — not you. Personalise the first clause.

> Hi [Name], I'm Ewan — I work with installation businesses around Gqeberha
> on a specific problem: quotes that get sent but then quietly go cold before
> anyone follows up. Quick question — roughly how many quotes does [Company]
> send in a month, and would you be able to say off-hand what value is
> currently sitting waiting on a decision? No pitch, just comparing notes with
> a few local installers this week.

Why it works: it names a real problem, asks a question they can't answer
precisely (which itself plants the seed), and explicitly disclaims a pitch.

**Do not** say "AI", "automation", "software", "platform", or "solution" in
the first message. **Do** send it one at a time, personalised — never a
visible broadcast.

## Step 3 — The conversation (10–15 min)

Goal: understand their process and find out if the pain is real. Ask, then
listen. These are the questions:

1. How many quotes do you send in a typical month?
2. Once a quote goes out, who's responsible for following it up — and how do
   they remember to?
3. Right now, could you tell me the total rand value of quotes still waiting
   on a decision? (Almost nobody can. That silence is the point.)
4. What happens when a customer replies three weeks later asking for a small
   change — how does that get picked up?
5. Where do you record whether a quote was won or lost?

If they can't answer 3 and they hesitate on 2 and 5, you've found the pain.

**Do not jump straight to asking for the full export here.** A stranger
who WhatsApped them out of nowhere asking for their customer list and deal
values is a big ask with zero trust behind it yet — a sensible owner
should hesitate at that, and did in early testing of this exact script.
Lower the ask first (Step 3b), and only raise it once there's a reason to
say yes.

## Step 3b — The rough number (no data changes hands)

Ask two harmless, round numbers out loud — nothing sensitive:

> Roughly how many quotes do you send a month, and roughly what's an
> average one worth?

Do the same rough math the website's own calculator does, live, in the
conversation: quotes/month × (a conservative fraction that typically go
quiet, e.g. 1 in 4) × average value. Say the resulting number out loud.

This is the actual hook — it costs them nothing to answer, and if it
lands, they've just heard a real rand figure about their own business
before handing over a single customer name.

## Step 4 — The real ask, only after the rough number lands

If they react ("wait, seriously?" / visibly surprised) — now ask for the
real thing, and make it easy to say yes to:

> That's a rough guess. I can get you the exact number if you send your
> actual quote list — happy to do it live on a screen-share where you
> keep the file on your own screen the whole time, or I'll send our
> one-page privacy commitment first if that's easier.

Both options remove the actual objection (handing sensitive data to an
unproven stranger) instead of just asking them to trust you anyway:
screen-share means the file never leaves their machine; the privacy
notice (`docs/templates/privacy-notice.md`) is a written commitment they
can read before deciding.

## Step 5 — Reading the signals

**Real pain (keep going):**
- They can't tell you the value sitting open, and it visibly bothers them.
- They volunteer stories ("ja, we lost a big one last year because...").
- They react to the rough number, and send the real export (or agree to a
  screen-share) without much chasing.
- They ask what you'd do about it.

**Polite interest (thank them, move on — don't chase):**
- "Sounds useful" / "interesting" with no specifics.
- The rough number doesn't land — no real reaction either way.
- They won't share data even with the screen-share/privacy-notice options
  offered ("I'd have to check with...").
- Vague answers about how follow-up "just happens".

Do not spend week 2 chasing polite nos. Spend it on the people who leaned in.

## Step 6 — The audit report (the demo)

Take their export and run it:

```bash
npx tsx scripts/generate-report.ts their-export.csv "Their Company Name"
```

Open the HTML, print to PDF, and send it — or better, walk them through it on
a call. The report leads with one number: the rand value sitting with no clear
outcome. That number is the entire demo.

**Always say, out loud and in the report:** this is not money you're
guaranteed to recover — it's the value of quotes nobody can currently account
for. Overpromising here destroys trust and it's built into the report's
wording for a reason. Under-claim; let the number speak.

## Step 7 — The close

In the same conversation as the report, ask directly. Don't leave it open.

> So this is a snapshot — but the real value is catching the next one before
> it goes cold. I'm taking on a few founding customers at R3,500 to get set
> up and R1,800 a month to keep it running and show you what gets recovered.
> Can I get you started?

Then stop talking. Let them answer.

If they say the price is high: the anchor is one recovered job. "If this helps
you close even one of the quotes in that report, it's paid for itself for the
year." If they're not ready: ask what would need to be true, and whether you
can check back after they've had a month to sit with the report.

## What "success" looks like this month

Not "everyone was friendly." Success is: 5 real exports, 2 owners who reacted
to their number with "how do we keep this running", and 2 signed pilots. If
you're not getting exports, the pain isn't landing — revisit the message and
the niche before building anything more.
