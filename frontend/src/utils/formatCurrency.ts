/**
 * Formats a number into a currency string
 * @param value - The number to format
 * @returns The formatted currency string
 */
export function formatCurrency(value: number): string {
  return "$".concat(
    value.toLocaleString("en-US", {
      notation: "compact",
      compactDisplay: "short",
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }),
  );
}
