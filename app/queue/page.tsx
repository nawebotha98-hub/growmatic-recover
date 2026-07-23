import { redirect } from "next/navigation";
import { TopNav } from "@/components/TopNav";
import { getQuotesForCompany, requireProfile, toRulesInput } from "@/lib/data";
import { formatRand } from "@/lib/money";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { DEFAULT_THRESHOLDS, detectExceptions, prioritise } from "@/lib/rules-engine";
import { ResolveButton } from "./ResolveButton";

const SEVERITY_STYLE: Record<string, string> = {
  high: "bg-risk/15 text-risk",
  medium: "bg-gold/15 text-gold",
  low: "bg-accent/15 text-accent",
};

export default async function QueuePage() {
  if (!isSupabaseConfigured()) {
    return (
      <main className="flex-1 flex items-center justify-center px-6">
        <p className="text-foreground-dim">Connect a database first — see the README.</p>
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
  const queue = prioritise(rulesInput, exceptions);
  const quoteById = new Map(quotes.map((q) => [q.id, q]));

  return (
    <>
      <TopNav />
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10">
        <h1 className="text-xl font-semibold mb-1">Recovery queue</h1>
        <p className="text-foreground-dim mb-6">
          {queue.length} quote{queue.length === 1 ? "" : "s"} need attention, highest value first.
        </p>

        {queue.length === 0 ? (
          <p className="text-foreground-dim">
            Nothing flagged right now — every open quote is still within threshold.
          </p>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden">
            {queue.map((item) => {
              const q = quoteById.get(item.quoteId);
              if (!q) return null;
              return (
                <div
                  key={item.quoteId}
                  className="flex items-center justify-between gap-4 px-4 py-4 border-b border-border last:border-b-0 bg-surface"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">{q.customer_name}</p>
                      <span
                        className={`text-xs font-mono px-2 py-0.5 rounded-full ${SEVERITY_STYLE[item.severity]}`}
                      >
                        {item.severity}
                      </span>
                    </div>
                    <p className="text-sm text-foreground-dim">
                      {q.quote_number ? `Quote ${q.quote_number} · ` : ""}
                      {item.ruleTriggered === "no_recorded_outcome"
                        ? "No recorded outcome"
                        : "Stale, no follow-up"}{" "}
                      · sent {item.daysSinceSent} days ago
                    </p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <p className="font-mono tabular-nums font-medium">
                      {formatRand(q.value_cents)}
                    </p>
                    <ResolveButton quoteId={q.id} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
