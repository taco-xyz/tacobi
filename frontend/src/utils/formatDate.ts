interface FormatDateProps {
  timestamp: string | number;
  format?: "short" | "long";
}

/**
 * Formats a timestamp into a date string
 * @param timestamp - The timestamp to format
 * @param format - The format of the date string
 * @returns The formatted date string
 */
export function formatDate({
  timestamp,
  format = "short",
}: FormatDateProps): string {
  // Create a date
  const date = new Date(timestamp);

  // Create the date formatting options
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    ...(format === "long" ? { year: "numeric" } : {}),
  };

  // Format the date
  return date.toLocaleDateString("en-US", options);
}
