import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildQuoteInsert } from "@/lib/import";
import type { ColumnMapping } from "@/lib/ai/mapColumns";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single();
  if (!profile) {
    return NextResponse.json({ error: "No profile for this user" }, { status: 403 });
  }

  const { rows, mapping } = (await request.json()) as {
    rows: Record<string, string>[];
    mapping: ColumnMapping;
  };
  if (!Array.isArray(rows)) {
    return NextResponse.json({ error: "rows must be an array" }, { status: 400 });
  }

  const inserts = [];
  const skipped: string[] = [];

  for (const row of rows) {
    const { record, skippedReason } = buildQuoteInsert(row, mapping, profile.company_id);
    if (record) {
      inserts.push(record);
    } else if (skippedReason) {
      skipped.push(skippedReason);
    }
  }

  if (inserts.length > 0) {
    const { error } = await supabase.from("quotes").insert(inserts);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({
    imported: inserts.length,
    skipped: skipped.length,
    skippedReasons: skipped,
  });
}
