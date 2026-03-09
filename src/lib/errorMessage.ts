/**
 * Sanitizes error messages for user display.
 * Strips Convex request IDs, stack traces, and other internal technical details.
 */
export function sanitizeErrorMessage(
  error: unknown,
  fallback: string
): string {
  const raw =
    error instanceof Error ? error.message : String(error ?? fallback);
  if (!raw || typeof raw !== "string") return fallback;

  // Strip Convex "[Request ID: xxx]" prefix
  let cleaned = raw.replace(/\[Request ID: [^\]]+\]\s*/g, "").trim();

  // Extract message from "Uncaught Error: <message>" or "Server Error Uncaught Error: <message>"
  const uncaughtMatch = /(?:Server Error\s+)?Uncaught Error:\s*([\s\S]+?)(?:\n|$)/.exec(
    cleaned
  );
  if (uncaughtMatch?.[1]) {
    cleaned = uncaughtMatch[1].trim();
  } else {
    // Strip common Convex/server prefixes if regex didn't match
    cleaned = cleaned
      .replace(/^Server Error\s*/i, "")
      .replace(/^Uncaught Error:\s*/i, "")
      .trim();
  }

  // Take only the first line (before stack trace)
  const firstLine = cleaned.split("\n")[0]?.trim() ?? "";
  if (!firstLine) return fallback;

  // Reject if it still looks like internal tech (safety net)
  if (
    /Request ID|at \w+\.\w+ \(|\/node_modules\/|\.ts:\d+|\.js:\d+/.test(
      firstLine
    )
  ) {
    return fallback;
  }

  return firstLine;
}
