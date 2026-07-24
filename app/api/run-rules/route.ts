import { NextResponse } from "next/server";
import { runRulesEngine } from "@/lib/runRulesEngine";

export const dynamic = "force-dynamic";
// This job reads across all tenants with the service-role key; never prerender,
// never cache, and give it room to work through a large book of quotes.
export const maxDuration = 60;

/**
 * The daily "keep watching" job. It re-checks every open, outcome-less quote
 * and persists an exceptions audit-trail row for anything newly gone stale.
 *
 * Two ways to authenticate a caller, both accepted:
 *   1. Vercel Cron — sends a GET with `Authorization: Bearer <CRON_SECRET>`
 *      when the CRON_SECRET env var is set. This is how the scheduled run in
 *      vercel.json triggers it in production.
 *   2. Any other scheduler / manual curl — send `x-cron-secret:
 *      <RULES_ENGINE_SECRET>`.
 *
 * Without a matching secret it returns 401 — this endpoint is service-role
 * privileged and cross-tenant, so it must never be openly callable.
 */
function isAuthorised(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader === `Bearer ${cronSecret}`) return true;
  }

  const manualSecret = process.env.RULES_ENGINE_SECRET;
  if (manualSecret && request.headers.get("x-cron-secret") === manualSecret) {
    return true;
  }

  return false;
}

async function handle(request: Request) {
  if (!isAuthorised(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const summary = await runRulesEngine();
    return NextResponse.json(summary);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// Vercel Cron triggers via GET; manual/other schedulers may use POST.
export const GET = handle;
export const POST = handle;
