import "server-only";

export type KnowledgeProviderName = "static" | "pgvector";

function boundedInt(value: string | undefined, fallback: number, max: number): number {
  const parsed = Number(value);
  const chosen = Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
  return Math.min(chosen, max);
}

export function chatConfig() {
  const provider = process.env.KNOWLEDGE_PROVIDER?.trim().toLowerCase();
  const knowledgeProvider: KnowledgeProviderName =
    provider === "pgvector" ? "pgvector" : "static";

  return {
    model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
    apiKeyConfigured: Boolean(process.env.OPENAI_API_KEY?.trim()),
    dailyLimit: boundedInt(process.env.CHAT_RATE_LIMIT_PER_DAY, 20, 100),
    windowMs: 24 * 60 * 60 * 1000,
    maxOutputTokens: boundedInt(process.env.CHAT_MAX_OUTPUT_TOKENS, 600, 1024),
    maxUserChars: boundedInt(process.env.CHAT_MAX_USER_CHARS, 2000, 4000),
    maxHistory: boundedInt(process.env.CHAT_MAX_HISTORY, 16, 24),
    knowledgeProvider,
    contactDailyLimit: boundedInt(process.env.CONTACT_RATE_LIMIT_PER_DAY, 5, 20),
  };
}
