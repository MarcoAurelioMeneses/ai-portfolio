import assert from "node:assert/strict";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText, tool, type LanguageModel } from "ai";
import { describe, it, vi } from "vitest";
import { z } from "zod";
import { chatModelCall, chatModelSettings, DEFAULT_CHAT_MODEL } from "@/lib/agent/chat-model";
import { estimateChatCost } from "@/lib/observability/pricing";

const scrollTool = {
  scroll_to: tool({
    description: "scroll",
    inputSchema: z.object({ target: z.string() }),
  }),
};

describe("gpt-6-luna request", () => {
  it("defaults to gpt-6-luna and pins reasoning effort at none", () => {
    assert.equal(DEFAULT_CHAT_MODEL, "gpt-6-luna");
    assert.deepEqual(chatModelSettings("gpt-6-luna"), {
      providerOptions: { openai: { reasoningEffort: "none" } },
    });
    assert.deepEqual(chatModelSettings("gpt-5.4"), {
      providerOptions: { openai: { reasoningEffort: "none" } },
    });
    assert.deepEqual(chatModelSettings("gpt-4o-mini"), {});
  });

  it("posts reasoning.effort none to the Responses API, with tools and without sampling params", async () => {
    const body = await captureRequest((provider) => provider(DEFAULT_CHAT_MODEL), {
      tools: scrollTool,
    });

    assert.equal(body.url, "https://api.openai.com/v1/responses");
    assert.equal(body.json.model, "gpt-6-luna");
    assert.equal(body.json.reasoning?.effort, "none");
    assert.equal(body.json.max_output_tokens, 600);
    assert.equal(body.json.tools?.[0]?.type, "function");
    assert.equal(body.json.tools?.[0]?.name, "scroll_to");
    assert.equal("temperature" in body.json, false);
    assert.equal("top_p" in body.json, false);
    assert.equal("frequency_penalty" in body.json, false);
    assert.equal("presence_penalty" in body.json, false);
  });

  it("sends reasoning_effort none on Chat Completions with and without tools", async () => {
    const withTools = await captureRequest((provider) => provider.chat(DEFAULT_CHAT_MODEL), {
      tools: scrollTool,
    });
    const withoutTools = await captureRequest(
      (provider) => provider.chat(DEFAULT_CHAT_MODEL),
      {},
    );

    for (const body of [withTools, withoutTools]) {
      assert.equal(body.url, "https://api.openai.com/v1/chat/completions");
      assert.equal(body.json.model, "gpt-6-luna");
      assert.equal(body.json.reasoning_effort, "none");
      assert.equal("temperature" in body.json, false);
      assert.equal("top_p" in body.json, false);
      assert.equal("frequency_penalty" in body.json, false);
      assert.equal("presence_penalty" in body.json, false);
      assert.equal("logprobs" in body.json, false);
    }

    assert.equal(withTools.json.tools?.[0]?.type, "function");
    assert.equal("tools" in withoutTools.json, false);
  });
});

describe("gpt-6-luna standard pricing", () => {
  it("uses $0.10 / 1M input and $0.50 / 1M output at or under 272K tokens", () => {
    const bill = estimateChatCost("gpt-6-luna", 272_000, 1_000);
    assert.equal(bill?.input, 272_000 * (0.1 / 1_000_000));
    assert.equal(bill?.output, 1_000 * (0.5 / 1_000_000));
  });

  it("bills a prompt above 272K input tokens at the long-context rates", () => {
    const long = estimateChatCost("gpt-6-luna", 272_001, 1_000_000);
    assert.equal(long?.input, 272_001 * 0.2 / 1_000_000);
    assert.equal(long?.output, 0.75);
  });
});

async function captureRequest(
  selectModel: (provider: ReturnType<typeof createOpenAI>) => LanguageModel,
  options: { tools?: typeof scrollTool },
) {
  let captured: { url: string; json: RequestJson } | undefined;
  const provider = createOpenAI({
    apiKey: "test-key",
    fetch: async (url, init) => {
      captured = {
        url: String(url),
        json: JSON.parse(String(init?.body ?? "{}")) as RequestJson,
      };
      return new Response(JSON.stringify({ error: { message: "stop" } }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    },
  });

  const error = console.error;
  console.error = vi.fn();
  try {
    const result = streamText({
      model: selectModel(provider),
      prompt: "oi",
      maxRetries: 0,
      tools: options.tools,
      ...chatModelCall(DEFAULT_CHAT_MODEL, 600),
    });

    try {
      await result.text;
    } catch {
      // The mock rejects the completion after the request body is captured.
    }
  } finally {
    console.error = error;
  }
  assert.ok(captured, "the model call did not reach fetch");
  return captured;
}

type RequestJson = {
  model: string;
  reasoning?: { effort?: string };
  reasoning_effort?: string;
  max_output_tokens?: number;
  tools?: Array<{ type?: string; name?: string }>;
};
