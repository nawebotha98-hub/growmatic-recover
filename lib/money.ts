export function formatRand(cents: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function parseRandToCents(input: string): number | null {
  const stripped = input.replace(/[^0-9.,-]/g, '');
  if (stripped === '' || stripped === '-') return null;

  const hasDot = stripped.includes('.');
  const hasComma = stripped.includes(',');

  let normalised = stripped;
  if (hasComma && !hasDot) {
    // No decimal point at all — is the comma a decimal separator ("R20 000,50",
    // the way Sage/Pastel exports often format rand values) or a thousands
    // separator ("20,000")? Exactly one comma followed by exactly two trailing
    // digits is the standard decimal-comma shape; anything else is thousands
    // grouping, so those commas just get dropped.
    const parts = stripped.split(',');
    const isDecimalComma = parts.length === 2 && parts[1].length === 2;
    normalised = isDecimalComma ? parts.join('.') : stripped.replace(/,/g, '');
  } else {
    // A dot is already present (or there's no separator at all) — any comma
    // here is a thousands separator, e.g. "1,234,567.89".
    normalised = stripped.replace(/,/g, '');
  }

  const value = Number.parseFloat(normalised);
  if (Number.isNaN(value)) return null;
  return Math.round(value * 100);
}
