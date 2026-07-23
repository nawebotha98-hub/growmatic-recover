import { NextResponse } from "next/server";
import { mapColumnsWithAI } from "@/lib/ai/mapColumns";

/** Takes the raw CSV headers a customer actually has and suggests a mapping. */
export async function POST(request: Request) {
  const { headers } = (await request.json()) as { headers: string[] };
  if (!Array.isArray(headers) || headers.length === 0) {
    return NextResponse.json({ error: "headers must be a non-empty array" }, { status: 400 });
  }

  const mapping = await mapColumnsWithAI(headers);
  return NextResponse.json({ mapping });
}
