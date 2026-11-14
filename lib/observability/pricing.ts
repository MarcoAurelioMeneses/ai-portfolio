/**
 * Standard text rates from the OpenAI pricing page, USD per token.
 * https://developers.openai.com/api/docs/pricing
 *
 * Flagship models, Standard tier. Short context is an input of at most 272K
 * tokens. A longer prompt is billed at 2× input and 1.5× output for the whole
 * request (gpt-6-luna short rates are $0.10 / $0.50 per 1M tokens, so the long
 * rates are $0.20 / $0.75). Cached input, cache writes, batch, flex, and fast
 * tiers are not included. gpt-4o-mini stays listed so an OPENAI_MODEL override
 * still gets a cost hint until that model shuts down.
 */
const SHORT_CONTEXT_INPUT_TOKENS = 272_000;

type TokenRates = {
  input: number;
  output: number;
  /** When set, a prompt above 272K input tokens uses these rates for the whole request. */
  long?: { input: number; output: number };
};

/** USD per 1M tokens. */
const STANDARD_PER_MILLION: Record<string, TokenRates> = {
  "gpt-6-luna": { input: 0.1, output: 0.5, long: { input: 0.2, output: 0.75 } },
  "gpt-4o-mini": { input: 0.15, output: 0.6 },
};

export function estimateChatCost(
  model: string,
  inputTokens: number,
  outputTokens: number,
): { input: number; output: number; total: number } | null {
  const rates = Object.entries(STANDARD_PER_MILLION).find(([id]) => model.includes(id))?.[1];
  if (!rates) return null;

  const selected =
    rates.long && inputTokens > SHORT_CONTEXT_INPUT_TOKENS ? rates.long : rates;
  const input = inputTokens * (selected.input / 1_000_000);
  const output = outputTokens * (selected.output / 1_000_000);
  return { input, output, total: input + output };
}
