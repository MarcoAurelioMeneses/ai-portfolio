/** Public list price for gpt-4o-mini, USD per token. Used only as a Langfuse cost hint. */
const GPT_4O_MINI = {
  inputPerToken: 0.15 / 1_000_000,
  outputPerToken: 0.6 / 1_000_000,
};

export function estimateChatCost(model: string, inputTokens: number, outputTokens: number) {
  if (!model.includes("gpt-4o-mini")) return null;
  const input = inputTokens * GPT_4O_MINI.inputPerToken;
  const output = outputTokens * GPT_4O_MINI.outputPerToken;
  return {
    input,
    output,
    total: input + output,
  };
}
