/**
 * Convert nanoseconds since epoch (bigint) to a readable date string.
 */
export function formatNanoDate(nanoseconds: bigint): string {
  const milliseconds = Number(nanoseconds / 1_000_000n);
  const date = new Date(milliseconds);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatNanoDateTime(nanoseconds: bigint): string {
  const milliseconds = Number(nanoseconds / 1_000_000n);
  const date = new Date(milliseconds);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
