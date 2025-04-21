/**
 * Formats a timestamp into a date string
 * @param timestamp - The timestamp to format
 * @returns The formatted date string
 */
export function formatDate(timestamp: string): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
