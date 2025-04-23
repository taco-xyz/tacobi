/**
 * Formats a number into a currency string
 * @param value - The number to format
 * @returns The formatted currency string
 */
export function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    notation: "compact",
    compactDisplay: "short",
    currency: "USD",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
}
