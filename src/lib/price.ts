export function formatPrice(value: number): string {
  return value.toFixed(2);
}

export function parseNonNegativePrice(value: string): number | null {
  const trimmedValue = value.trim();
  if (!trimmedValue) return null;

  const parsedValue = Number.parseFloat(trimmedValue);
  if (!Number.isFinite(parsedValue) || parsedValue < 0) return null;

  return parsedValue;
}
