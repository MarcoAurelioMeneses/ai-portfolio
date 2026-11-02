import type { RateLimitResult, RateLimitStore } from "@/lib/rate-limit/types";

type Bucket = { count: number; resetAt: number };

/**
 * Process-local limiter. Survives only as long as the server process,
 * so serverless deployments should switch RATE_LIMIT_PROVIDER.
 */
export function createMemoryRateLimitStore(
  now: () => number = Date.now,
): RateLimitStore {
  const buckets = new Map<string, Bucket>();

  return {
    name: "memory",
    async consume(key, limit, windowMs): Promise<RateLimitResult> {
      const current = now();
      const existing = buckets.get(key);
      if (!existing || existing.resetAt <= current) {
        const resetAt = current + windowMs;
        buckets.set(key, { count: 1, resetAt });
        return { allowed: true, remaining: Math.max(limit - 1, 0), resetAt };
      }
      if (existing.count >= limit) {
        return { allowed: false, remaining: 0, resetAt: existing.resetAt };
      }
      existing.count += 1;
      return {
        allowed: true,
        remaining: Math.max(limit - existing.count, 0),
        resetAt: existing.resetAt,
      };
    },
  };
}

const shared = createMemoryRateLimitStore();

export function getMemoryRateLimitStore(): RateLimitStore {
  return shared;
}
