import { NextResponse } from "next/server";
import { runRulesEngine } from "@/lib/runRulesEngine";

export const dynamic = "force-dynamic";

/**
 * Hit once a day by an external scheduler (Railway cron, GitHub Actions
 * scheduled workflow, or a Supabase cron job calling this URL). Not reachable
 * without the shared secret — this is service-role-privileged, cross-tenant.
 */
export async function POST(request: Request) {
  const secret = request.headers.get("x-cron-secret");
  if (!process.env.RULES_ENGINE_SECRET || secret !== process.env.RULES_ENGINE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const summary = await runRulesEngine();
    return NextResponse.json(summary);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
