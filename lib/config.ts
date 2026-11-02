export type KnowledgeProviderName = "static" | "pgvector";

function positiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
}

export function chatConfig() {
  const provider = process.env.KNOWLEDGE_PROVIDER?.trim().toLowerCase();
  const knowledgeProvider: KnowledgeProviderName =
    provider === "pgvector" ? "pgvector" : "static";

  return {
    model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
    apiKeyConfigured: Boolean(process.env.OPENAI_API_KEY?.trim()),
    dailyLimit: positiveInt(process.env.CHAT_RATE_LIMIT_PER_DAY, 20),
    windowMs: 24 * 60 * 60 * 1000,
    maxOutputTokens: positiveInt(process.env.CHAT_MAX_OUTPUT_TOKENS, 600),
    maxUserChars: positiveInt(process.env.CHAT_MAX_USER_CHARS, 2000),
    maxHistory: positiveInt(process.env.CHAT_MAX_HISTORY, 16),
    knowledgeProvider,
  };
}
