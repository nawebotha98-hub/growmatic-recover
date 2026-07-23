import Link from "next/link";
import { redirect } from "next/navigation";
import { TopNav } from "@/components/TopNav";
import { getQuotesForCompany, requireProfile, toRulesInput } from "@/lib/data";
import { formatRand } from "@/lib/money";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  DEFAULT_THRESHOLDS,
  detectExceptions,
  prioritise,
  revenueAtRiskCents,
} from "@/lib/rules-engine";

export default async function DashboardPage() {
  if (!isSupabaseConfigured()) {
    return (
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-semibold mb-3">No database connected yet</h1>
          <p className="text-foreground-dim">
            Add your Supabase credentials to <code className="font-mono text-sm">.env.local</code>{" "}
            — see the README.
          </p>
        </div>
      </main>
    );
  }

  let profile;
  try {
    profile = await requireProfile();
  } catch {
    redirect("/login");
  }

  const quotes = await getQuotesForCompany(profile.company_id);
  const rulesInput = quotes.map(toRulesInput);
  const exceptions = detectExceptions(rulesInput, DEFAULT_THRESHOLDS);
  const queue = prioritise(rulesInput, exceptions).slice(0, 5);
  const atRisk = revenueAtRiskCents(rulesInput, DEFAULT_THRESHOLDS);

  const quoteById = new Map(quotes.map((q) => [q.id, q]));

  return (
    <>
      <TopNav />
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10">
        {quotes.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <section className="mb-10">
              <p className="text-sm font-mono uppercase tracking-wide text-foreground-dim mb-2">
                Revenue at risk
              </p>
              <p className="text-5xl font-semibold tabular-nums">{formatRand(atRisk)}</p>
              <p className="text-foreground-dim mt-2">
                across {exceptions.length} quote{exceptions.length === 1 ? "" : "s"} with no clear
                outcome, out of {quotes.length} imported.
              </p>
            </section>

            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold">Needs attention first</h2>
                <Link href="/queue" className="text-sm text-accent hover:underline">
                  View full recovery queue →
                </Link>
              </div>
              <div className="border border-border rounded-lg overflow-hidden">
                {queue.map((item) => {
                  const q = quoteById.get(item.quoteId);
                  if (!q) return null;
                  return (
                    <div
                      key={item.quoteId}
                      className="flex items-center justify-between px-4 py-3 border-b border-border last:border-b-0 bg-surface"
                    >
                      <div>
                        <p className="font-medium">{q.customer_name}</p>
                        <p className="text-sm text-foreground-dim">
                          {item.ruleTriggered === "no_recorded_outcome"
                            ? "No recorded outcome"
                            : "Stale, no follow-up"}{" "}
                          · {item.daysSinceSent} days since sent
                        </p>
                      </div>
                      <p className="font-mono tabular-nums font-medium">
                        {formatRand(q.value_cents)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </main>
    </>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20">
      <h1 className="text-xl font-semibold mb-2">No quotes imported yet</h1>
      <p className="text-foreground-dim mb-6">
        Import a spreadsheet export to see your revenue-at-risk number.
      </p>
      <Link
        href="/upload"
        className="inline-block bg-accent text-white px-5 py-2.5 rounded-md font-medium hover:opacity-90 transition-opacity"
      >
        Import quotes
      </Link>
    </div>
  );
}
