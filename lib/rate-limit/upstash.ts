import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { RateLimitStore } from "@/lib/rate-limit/types";

export function createUpstashRateLimitStore(): RateLimitStore | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const redis = new Redis({ url, token });
  const cache = new Map<string, Ratelimit>();

  return {
    name: "upstash",
    async consume(key, limit, windowMs) {
      const windowSec = Math.max(1, Math.round(windowMs / 1000));
      const cacheKey = `${limit}:${windowSec}`;
      let limiter = cache.get(cacheKey);
      if (!limiter) {
        limiter = new Ratelimit({
          redis,
          limiter: Ratelimit.fixedWindow(limit, `${windowSec} s`),
          prefix: "portfolio-chat",
          analytics: false,
        });
        cache.set(cacheKey, limiter);
      }
      const result = await limiter.limit(key);
      return {
        allowed: result.success,
        remaining: result.remaining,
        resetAt: result.reset,
      };
    },
  };
}
