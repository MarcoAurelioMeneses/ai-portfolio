import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { RateLimitStore } from "@/lib/rate-limit/types";

type ConsumeRow = {
  allowed: boolean;
  remaining: number;
  reset_at: string;
};

/**
 * Calls the `consume_rate_limit` SQL function from
 * supabase/migrations/0001_rate_limit_and_knowledge.sql.
 * The service role key stays on the server.
 */
export function createSupabaseRateLimitStore(): RateLimitStore | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  const client: SupabaseClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return {
    name: "supabase",
    async consume(bucketKey, limit, windowMs) {
      const { data, error } = await client.rpc("consume_rate_limit", {
        bucket_key: bucketKey,
        max_count: limit,
        window_seconds: Math.max(1, Math.round(windowMs / 1000)),
      });
      if (error) throw error;
      const row = (Array.isArray(data) ? data[0] : data) as ConsumeRow | null;
      if (!row) {
        throw new Error("Supabase rate limit returned no row.");
      }
      return {
        allowed: Boolean(row.allowed),
        remaining: Number(row.remaining) || 0,
        resetAt: new Date(row.reset_at).getTime(),
      };
    },
  };
}
