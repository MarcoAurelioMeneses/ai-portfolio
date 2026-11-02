import type { UIMessage } from "ai";
import { site } from "@/content/site";

type TextPart = { type: "text"; text: string };

function isTextPart(part: UIMessage["parts"][number]): part is TextPart {
  return part.type === "text" && typeof part.text === "string";
}

export function messageText(message: UIMessage | undefined): string {
  if (!message) return "";
  return message.parts.filter(isTextPart).map((part) => part.text).join("\n");
}

export function prepareChatMessages(
  body: unknown,
  maxUserChars: number,
  maxHistory: number,
):
  | { ok: true; messages: UIMessage[]; lastUserText: string }
  | { ok: false; message: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, message: site.chat.errors.invalid };
  }
  const messages = (body as { messages?: unknown }).messages;
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 40) {
    return { ok: false, message: site.chat.errors.invalid };
  }

  const parsed: UIMessage[] = [];
  for (const item of messages) {
    if (!item || typeof item !== "object") {
      return { ok: false, message: site.chat.errors.invalid };
    }
    const record = item as { id?: unknown; role?: unknown; parts?: unknown };
    if (record.role !== "user" && record.role !== "assistant") continue;
    if (typeof record.id !== "string" || !Array.isArray(record.parts)) {
      return { ok: false, message: site.chat.errors.invalid };
    }
    parsed.push(item as UIMessage);
  }

  const trimmed = parsed.slice(-maxHistory);
  const lastUser = [...trimmed].reverse().find((message) => message.role === "user");
  const lastUserText = messageText(lastUser).trim();
  if (!lastUserText || lastUserText.length > maxUserChars) {
    return { ok: false, message: site.chat.errors.invalid };
  }
  return { ok: true, messages: trimmed, lastUserText };
}
