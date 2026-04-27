export type SizeStockMap = Record<string, number>;

/**
 * Parses a comma-separated sizes list into normalized size labels.
 */
export function parseSizes(sizes: string): string[] {
  return sizes
    .split(",")
    .map((size) => size.trim())
    .filter(Boolean);
}

/**
 * Safely parses persisted JSON size stock payloads.
 */
export function parseSizeStock(sizeStock: string | null | undefined): SizeStockMap {
  if (!sizeStock) return {};

  try {
    const value = JSON.parse(sizeStock) as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, quantity]) => Number.isFinite(Number(quantity)))
        .map(([size, quantity]) => [size, Math.max(0, Math.floor(Number(quantity)))])
    );
  } catch {
    return {};
  }
}

/**
 * Builds a per-size stock map from selected sizes and user-entered stock values.
 */
export function buildSizeStock(sizes: string[], stockBySize: SizeStockMap): SizeStockMap {
  return Object.fromEntries(
    sizes.map((size) => [size, Math.max(0, Math.floor(Number(stockBySize[size] ?? 0)))])
  );
}

/**
 * Computes total stock from per-size inventory values.
 */
export function getTotalStock(sizeStock: SizeStockMap): number {
  return Object.values(sizeStock).reduce((sum, quantity) => sum + quantity, 0);
}

/**
 * Compatibility helper for old records with only `sizes` + aggregate `stock`.
 */
export function getInitialSizeStock(
  sizeStock: string | null | undefined,
  sizes: string,
  stock: number
): SizeStockMap {
  const parsed = parseSizeStock(sizeStock);
  if (Object.keys(parsed).length > 0) return parsed;

  const normalizedSizes = parseSizes(sizes);
  if (normalizedSizes.length === 0) return {};

  const fallback: SizeStockMap = { [normalizedSizes[0]]: Math.max(0, Math.floor(stock)) };
  for (let index = 1; index < normalizedSizes.length; index += 1) {
    fallback[normalizedSizes[index]] = 0;
  }
  return fallback;
}
