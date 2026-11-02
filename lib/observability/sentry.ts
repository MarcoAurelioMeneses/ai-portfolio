import "server-only";
import { scrubText, scrubUnknown } from "@/lib/security/scrub";

export async function reportServerError(
  error: unknown,
  context?: Record<string, unknown>,
): Promise<void> {
  const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;
  const safe = new Error(scrubText(error instanceof Error ? error.message : "Unknown server error"));
  if (error instanceof Error && error.stack) safe.stack = scrubText(error.stack);
  try {
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureException(safe, {
      extra: context ? (scrubUnknown(context) as Record<string, unknown>) : undefined,
    });
  } catch {
    console.error("Sentry report failed");
  }
}
