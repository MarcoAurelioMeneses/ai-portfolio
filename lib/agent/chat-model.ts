/**
 * gpt-6-luna is a reasoning model. `reasoning.effort` defaults to `medium`.
 * https://developers.openai.com/api/docs/models/gpt-6-luna
 *
 * The AI SDK's `openai(model)` posts to the Responses API (`/v1/responses`),
 * where this option is `reasoning.effort`. Chat Completions (`/v1/chat/completions`)
 * accepts the same option as `reasoning_effort`, and that endpoint can use
 * function tools only when the effort is `none`. Pin `none` for every GPT-5
 * and GPT-6 id, with or without tools, so hidden reasoning tokens are not
 * billed against the output cap. `minimal` is not one of this model's efforts.
 *
 * Temperature, top_p, and frequency/presence penalties stay unset. They are
 * unsupported while the model is reasoning.
 */
export const DEFAULT_CHAT_MODEL = "gpt-6-luna";

export function chatModelCall(model: string, maxOutputTokens: number) {
  return {
    maxOutputTokens,
    ...chatModelSettings(model),
  };
}

export function chatModelSettings(model: string): {
  providerOptions?: { openai: { reasoningEffort: "none" } };
} {
  if (!/gpt-(?:5|6)/.test(model)) return {};
  return { providerOptions: { openai: { reasoningEffort: "none" } } };
}
