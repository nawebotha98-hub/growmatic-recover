@AGENTS.md

## Standing authorization (added 2026-07-28, per Ewan)

Ewan has asked to reduce how often he has to explicitly approve routine
work, so the following is pre-authorized in this repo — Claude should act
on it directly (still reporting back what was done), not wait for a
message first:

- Diagnosing and fixing bugs, including committing and pushing the fix
  straight to the default branch and letting the deploy pipeline run
- Routine maintenance: dependency bumps, failing tests, broken links,
  deploy-pipeline breakage, security-advisor findings
- Health checks against live systems (deploy status, logs, DB state) and
  writing up findings in the relevant `docs/` file
- Implementing design/copy changes Ewan has asked for in conversation —
  verify it actually works (screenshot or test) before shipping, same bar
  as always, just without a separate "should I ship this?" round-trip

Still requires Ewan's explicit sign-off, every time, no exceptions:

- Anything involving money: payments, billing, invoicing, purchases
- Anything legal: pilot agreements, privacy notices, terms, registrations
- Sending real outreach/sales messages to prospects or customers
- Secrets/credentials: adding, rotating, or viewing production secrets
  (service-role keys, API keys, payment credentials) — these shouldn't be
  pasted into chat in the first place, and setting them in a provider
  dashboard stays a manual, human step
- Irreversible infrastructure changes: deleting data, changing DNS/domain
  configuration, force-pushing over existing history

When it's unclear which bucket something falls into, default to asking.
