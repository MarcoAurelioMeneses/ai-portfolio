import "server-only";
import { z } from "zod";
import type { UIMessage } from "ai";
import { site } from "@/content/site";

const ALLOWED_TOOL_TYPES = new Set(["tool-scroll_to", "tool-show_contact"]);
const PASSTHROUGH_PART_TYPES = new Set(["text", "step-start", "reasoning"]);
const MAX_PARTS = 12;
const MAX_TOOL_JSON = 2_000;
const MAX_BODY_CHARS = 48_000;

const partSchema = z
  .object({
    type: z.string().min(1).max(64),
    text: z.string().max(8_000).optional(),
    toolCallId: z.string().min(1).max(80).optional(),
    state: z.string().min(1).max(40).optional(),
    input: z.unknown().optional(),
    output: z.unknown().optional(),
  })
  .strip();

const messageSchema = z
  .object({
    id: z.string().min(1).max(80),
    role: z.enum(["user", "assistant"]),
    parts: z.array(partSchema).max(MAX_PARTS),
  })
  .strip();

const bodySchema = z
  .object({
    id: z.string().max(80).optional(),
    messages: z.array(messageSchema).min(1).max(32),
    trigger: z.enum(["submit-message", "regenerate-message"]).optional(),
    messageId: z.string().max(80).optional(),
  })
  .strip();

type ParsedPart = z.infer<typeof partSchema>;

function boundedToolValue(value: unknown): unknown {
  if (value === undefined) return undefined;
  try {
    const encoded = JSON.stringify(value);
    if (encoded.length <= MAX_TOOL_JSON) return value;
  } catch {
    return undefined;
  }
  return { truncated: true };
}

function sanitizePart(part: ParsedPart, maxUserChars: number): Record<string, unknown> | null {
  if (part.type === "text") {
    if (typeof part.text !== "string") return null;
    return { type: "text", text: part.text.slice(0, maxUserChars) };
  }
  if (part.type === "reasoning") {
    return { type: "reasoning", text: (part.text ?? "").slice(0, maxUserChars) };
  }
  if (part.type === "step-start") return { type: "step-start" };
  if (!ALLOWED_TOOL_TYPES.has(part.type) || !part.toolCallId || !part.state) return null;
  return {
    type: part.type,
    toolCallId: part.toolCallId,
    state: part.state,
    ...(part.input !== undefined ? { input: boundedToolValue(part.input) } : {}),
    ...(part.output !== undefined ? { output: boundedToolValue(part.output) } : {}),
  };
}

function textOf(parts: Array<Record<string, unknown>>): string {
  return parts
    .filter((part) => part.type === "text" && typeof part.text === "string")
    .map((part) => part.text as string)
    .join("\n")
    .trim();
}

export function prepareChatMessages(
  raw: string,
  maxUserChars: number,
  maxHistory: number,
):
  | { ok: true; messages: UIMessage[]; lastUserText: string }
  | { ok: false; status: number; message: string } {
  if (raw.length > MAX_BODY_CHARS) {
    return { ok: false, status: 413, message: site.chat.errors.invalid };
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return { ok: false, status: 400, message: site.chat.errors.invalid };
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return { ok: false, status: 400, message: site.chat.errors.invalid };
  }

  const historyLimit = Math.min(Math.max(maxHistory, 1), 24);
  const charLimit = Math.min(Math.max(maxUserChars, 1), 4_000);
  const selected = parsed.data.messages.slice(-historyLimit);
  const messages: UIMessage[] = [];
  let totalChars = 0;

  for (const message of selected) {
    const parts = message.parts.flatMap((part) => {
      if (!PASSTHROUGH_PART_TYPES.has(part.type) && !ALLOWED_TOOL_TYPES.has(part.type)) {
        return [];
      }
      const sanitized = sanitizePart(part, charLimit);
      return sanitized ? [sanitized] : [];
    });
    const text = textOf(parts);
    totalChars += text.length;
    if (totalChars > charLimit * 4) {
      return { ok: false, status: 400, message: site.chat.errors.invalid };
    }
    if (message.role === "user" && text.length > charLimit) {
      return { ok: false, status: 400, message: site.chat.errors.invalid };
    }
    messages.push({ id: message.id, role: message.role, parts } as UIMessage);
  }

  const last = messages.at(-1);
  const lastUserText = last?.role === "user" ? textOf(last.parts as Array<Record<string, unknown>>) : "";
  if (!lastUserText) {
    return { ok: false, status: 400, message: site.chat.errors.invalid };
  }

  return { ok: true, messages, lastUserText };
}
