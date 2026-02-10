/**
 * Calculate 10% connection fee from provider rate
 * @param rate Provider rate in KES (bigint)
 * @returns Connection fee (bigint)
 */
export function calculateConnectionFee(rate: bigint): bigint {
  // 10% of rate, rounded down
  return (rate * 10n) / 100n;
}

/**
 * Format KES amount for display
 * @param amount Amount in KES (bigint)
 * @returns Formatted string (e.g., "KES 1,000")
 */
export function formatKES(amount: bigint): string {
  return `KES ${Number(amount).toLocaleString()}`;
}
