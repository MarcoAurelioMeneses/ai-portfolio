import { Langfuse } from "langfuse";
import { estimateChatCost } from "@/lib/observability/pricing";

type ChatTrace = {
  model: string;
  input: unknown;
  output: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  knowledgeProvider: string;
  rateLimitProvider: string;
};

let client: Langfuse | null | undefined;

function getClient(): Langfuse | null {
  if (client !== undefined) return client;
  const publicKey = process.env.LANGFUSE_PUBLIC_KEY;
  const secretKey = process.env.LANGFUSE_SECRET_KEY;
  if (!publicKey || !secretKey) {
    client = null;
    return client;
  }
  client = new Langfuse({
    publicKey,
    secretKey,
    baseUrl: process.env.LANGFUSE_BASE_URL || "https://cloud.langfuse.com",
  });
  return client;
}

/** Records one chat generation. No-ops when Langfuse keys are absent. */
export async function recordChatTrace(trace: ChatTrace): Promise<void> {
  const langfuse = getClient();
  if (!langfuse) return;

  const started = new Date(Date.now() - trace.latencyMs);
  const cost = estimateChatCost(trace.model, trace.inputTokens, trace.outputTokens);
  const root = langfuse.trace({
    name: "portfolio-chat",
    input: trace.input,
    output: trace.output,
    tags: ["portfolio", "chat"],
    metadata: {
      knowledgeProvider: trace.knowledgeProvider,
      rateLimitProvider: trace.rateLimitProvider,
      latencyMs: trace.latencyMs,
    },
  });

  root.generation({
    name: "openai-response",
    model: trace.model,
    input: trace.input,
    output: trace.output,
    startTime: started,
    endTime: new Date(),
    usageDetails: {
      input: trace.inputTokens,
      output: trace.outputTokens,
      total: trace.inputTokens + trace.outputTokens,
    },
    ...(cost
      ? {
          costDetails: {
            input: cost.input,
            output: cost.output,
            total: cost.total,
          },
        }
      : {}),
  });

  await langfuse.flushAsync();
}
