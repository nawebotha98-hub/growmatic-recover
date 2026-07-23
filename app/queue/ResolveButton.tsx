"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ResolveButton({ quoteId }: { quoteId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-sm border border-border rounded-md px-3 py-1.5 hover:bg-background transition-colors"
      >
        Log outcome
      </button>
    );
  }

  // "Won" records the quote's own value as recovered — the server derives the
  // rand amount from the quote itself, so there's nothing for a human to mistype.
  async function resolve(outcome: "recovered" | "lost") {
    setSubmitting(true);
    await fetch(`/api/quotes/${quoteId}/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ outcome }),
    });
    setSubmitting(false);
    setOpen(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <button
        disabled={submitting}
        onClick={() => resolve("recovered")}
        className="border border-accent text-accent rounded-md px-3 py-1.5 hover:bg-accent/10 transition-colors disabled:opacity-50"
      >
        Won
      </button>
      <button
        disabled={submitting}
        onClick={() => resolve("lost")}
        className="border border-border rounded-md px-3 py-1.5 hover:bg-background transition-colors disabled:opacity-50"
      >
        Lost
      </button>
      <button
        disabled={submitting}
        onClick={() => setOpen(false)}
        className="text-foreground-dim px-2"
      >
        Cancel
      </button>
    </div>
  );
}
