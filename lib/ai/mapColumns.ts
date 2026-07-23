import Anthropic from '@anthropic-ai/sdk';

export interface ColumnMapping {
  customer_name: string | null;
  quote_number: string | null;
  value: string | null;
  sent_at: string | null;
  status: string | null;
}

const FIELD_HINTS: Record<keyof ColumnMapping, string[]> = {
  customer_name: ['customer', 'client', 'name', 'contact'],
  quote_number: ['quoteno', 'quotenum', 'quoteref', 'reference', 'number', 'docno'],
  value: ['value', 'amount', 'total', 'excl', 'price', 'quoted'],
  sent_at: ['date', 'sent', 'created', 'issued'],
  status: ['status', 'stage', 'outcome', 'state'],
};

/** Deterministic fallback — no API key required, works offline, always returns something. */
export function heuristicMapColumns(headers: string[]): ColumnMapping {
  const normalise = (h: string) => h.toLowerCase().replace(/[^a-z]/g, '');
  const find = (hints: string[]) =>
    headers.find((h) => hints.some((hint) => normalise(h).includes(hint))) ?? null;

  return {
    customer_name: find(FIELD_HINTS.customer_name),
    quote_number: find(FIELD_HINTS.quote_number),
    value: find(FIELD_HINTS.value),
    sent_at: find(FIELD_HINTS.sent_at),
    status: find(FIELD_HINTS.status),
  };
}

function extractJsonObject(text: string): string {
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : '{}';
}

/**
 * Ask Claude to map a customer's real-world (messy, inconsistent) column
 * headers onto our schema. Falls back to the heuristic matcher — silently,
 * not with an error — whenever there's no API key or the model call fails,
 * so a broken/missing key degrades gracefully instead of blocking an import.
 */
export async function mapColumnsWithAI(headers: string[]): Promise<ColumnMapping> {
  const fallback = heuristicMapColumns(headers);
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return fallback;

  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content:
            `These are the column headers from a real quotes export: ${JSON.stringify(headers)}\n\n` +
            'Map each of these target fields to the header that best matches it, or null if nothing fits: ' +
            'customer_name, quote_number, value, sent_at, status.\n\n' +
            'Respond with ONLY a JSON object using exactly those five keys, ' +
            'values being one of the given header strings verbatim, or null.',
        },
      ],
    });

    const textBlock = message.content.find((block) => block.type === 'text');
    if (!textBlock || textBlock.type !== 'text') return fallback;

    const parsed = JSON.parse(extractJsonObject(textBlock.text)) as Partial<ColumnMapping>;

    // Only trust values Claude actually saw in the real header list —
    // never let a hallucinated header string reach the importer.
    const validated: ColumnMapping = { ...fallback };
    for (const key of Object.keys(FIELD_HINTS) as Array<keyof ColumnMapping>) {
      const candidate = parsed[key];
      if (candidate && headers.includes(candidate)) {
        validated[key] = candidate;
      }
    }
    return validated;
  } catch {
    return fallback;
  }
}
