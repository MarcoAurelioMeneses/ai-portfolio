export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

/**
 * Pluggable daily counter. Implementations: in-memory, Upstash Redis, Supabase.
 * `key` must already be a hash — stores should not receive a raw IP.
 */
export interface RateLimitStore {
  readonly name: string;
  consume(
    key: string,
    limit: number,
    windowMs: number,
  ): Promise<RateLimitResult>;
}
