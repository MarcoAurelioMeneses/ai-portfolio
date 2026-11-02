import { convertToModelMessages, isStepCount, streamText, type UIMessage } from "ai";
import { openai } from "@ai-sdk/openai";
import { site } from "@/content/site";
import { prepareChatMessages } from "@/lib/agent/messages";
import { buildSystemPrompt } from "@/lib/agent/prompt";
import { createRetriever } from "@/lib/agent/retriever";
import { agentTools } from "@/lib/agent/tools";
import { chatConfig } from "@/lib/config";
import { recordChatTrace } from "@/lib/observability/langfuse";
import { reportServerError } from "@/lib/observability/sentry";
import { isSameOriginRequest } from "@/lib/security/origin";
import { getClientIp, hashClientKey } from "@/lib/rate-limit/identity";
import { getRateLimitStore } from "@/lib/rate-limit";

export const maxDuration = 30;

function jsonError(status: number, error: string, message: string, headers?: HeadersInit) {
  return Response.json({ error, message }, { status, headers });
}

export async function GET() {
  const config = chatConfig();
  return Response.json({
    ok: true,
    aiConfigured: config.apiKeyConfigured,
  });
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return jsonError(403, "forbidden", site.chat.errors.generic);
  }

  const config = chatConfig();
  const raw = await request.text();
  const prepared = prepareChatMessages(raw, config.maxUserChars, config.maxHistory);
  if (!prepared.ok) {
    return jsonError(prepared.status, "invalid", prepared.message);
  }

  if (!config.apiKeyConfigured) {
    return jsonError(503, "unconfigured", site.chat.errors.unconfigured);
  }

  const limiter = getRateLimitStore();
  const clientKey = hashClientKey(getClientIp(request));
  let rate: Awaited<ReturnType<typeof limiter.consume>>;
  try {
    rate = await limiter.consume(clientKey, config.dailyLimit, config.windowMs);
  } catch (error) {
    await reportServerError(error, { area: "rate-limit", provider: limiter.name });
    return jsonError(500, "rate_limit_unavailable", site.chat.errors.generic);
  }

  if (!rate.allowed) {
    const retryAfter = Math.max(1, Math.ceil((rate.resetAt - Date.now()) / 1000));
    return jsonError(429, "rate_limited", site.chat.errors.rateLimited, {
      "Retry-After": String(retryAfter),
      "X-RateLimit-Remaining": "0",
    });
  }

  const startedAt = Date.now();
  try {
    const retriever = createRetriever(config.knowledgeProvider);
    const chunks = await retriever.retrieve(prepared.lastUserText);
    const modelMessages = await convertToModelMessages(
      prepared.messages as Array<Omit<UIMessage, "id">>,
      { tools: agentTools, ignoreIncompleteToolCalls: true },
    );

    const result = streamText({
      model: openai(config.model),
      system: buildSystemPrompt(chunks),
      messages: modelMessages,
      tools: agentTools,
      stopWhen: isStepCount(4),
      maxOutputTokens: config.maxOutputTokens,
      onError: ({ error }) => {
        void reportServerError(error, { area: "chat-stream" });
      },
      onEnd: async (event) => {
        try {
          await recordChatTrace({
            model: config.model,
            input: prepared.lastUserText,
            output: event.text,
            inputTokens: event.usage.inputTokens ?? 0,
            outputTokens: event.usage.outputTokens ?? 0,
            latencyMs: Date.now() - startedAt,
            knowledgeProvider: retriever.name,
            rateLimitProvider: limiter.name,
          });
        } catch (error) {
          await reportServerError(error, { area: "langfuse" });
        }
      },
    });

    return result.toUIMessageStreamResponse({
      headers: {
        "X-RateLimit-Remaining": String(rate.remaining),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    await reportServerError(error, { area: "chat" });
    return jsonError(500, "chat_failed", site.chat.errors.generic);
  }
}
