interface FormatTokenCurrencyProps {
  value: number;
  decimals: number;
  symbol: string;
}

/**
 * Formats a number into a token currency string
 * @param value - The number to format
 * @param decimals - The number of decimals to display
 * @param symbol - The symbol to display
 * @returns The formatted token currency string
 */
export function formatTokenCurrency({
  value,
  decimals,
  symbol,
}: FormatTokenCurrencyProps): string {
  return (
    value
      // Display the correct number of decimals
      .toLocaleString("en-US", {
        maximumFractionDigits: decimals,
        minimumFractionDigits: decimals,
      })
      // Add the symbol at the end
      .concat(" ", symbol)
  );
}
