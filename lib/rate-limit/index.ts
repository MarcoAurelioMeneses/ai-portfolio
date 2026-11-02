import "server-only";
import { getMemoryRateLimitStore } from "@/lib/rate-limit/memory";
import { createSupabaseRateLimitStore } from "@/lib/rate-limit/supabase";
import type { RateLimitStore } from "@/lib/rate-limit/types";
import { createUpstashRateLimitStore } from "@/lib/rate-limit/upstash";

let cached: RateLimitStore | null = null;

/**
 * Selects a store from RATE_LIMIT_PROVIDER.
 * Missing credentials fall back to the in-memory store so the site still runs.
 */
export function getRateLimitStore(): RateLimitStore {
  if (cached) return cached;
  const requested = (process.env.RATE_LIMIT_PROVIDER ?? "memory")
    .trim()
    .toLowerCase();

  if (requested === "upstash") {
    const store = createUpstashRateLimitStore();
    if (store) {
      cached = store;
      return store;
    }
    console.warn(
      "RATE_LIMIT_PROVIDER=upstash but Upstash credentials are missing. Using memory.",
    );
  }

  if (requested === "supabase") {
    const store = createSupabaseRateLimitStore();
    if (store) {
      cached = store;
      return store;
    }
    console.warn(
      "RATE_LIMIT_PROVIDER=supabase but Supabase credentials are missing. Using memory.",
    );
  }

  cached = getMemoryRateLimitStore();
  return cached;
}
