"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { ChatIcon, CloseIcon, SendIcon } from "@/components/icons";
import { ContactCard, readContactCard } from "@/components/chat/contact-card";
import { useChatPanel } from "@/components/chat/chat-context";
import { Tag } from "@/components/tag";
import { site } from "@/content/site";
import { isCaseId, resolveScrollElementId } from "@/lib/agent/targets";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";

async function chatFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const response = await fetch(input, init);
  if (!response.ok) {
    let message: string = site.chat.errors.generic;
    try {
      const data = (await response.json()) as { message?: unknown };
      if (typeof data.message === "string") message = data.message;
    } catch {
      message = site.chat.errors.generic;
    }
    throw new Error(message);
  }
  return response;
}

function textFrom(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => ("text" in part ? part.text : ""))
    .join("");
}

function isToolPart(
  part: UIMessage["parts"][number],
): part is UIMessage["parts"][number] & {
  type: `tool-${string}`;
  state: string;
  toolCallId: string;
  output?: unknown;
} {
  return part.type.startsWith("tool-") && "toolCallId" in part && "state" in part;
}

export function ChatWidget() {
  const { open, openChat, closeChat } = useChatPanel();
  const [draft, setDraft] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const scrolledTools = useRef(new Set<string>());
  const [transport] = useState(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        fetch: chatFetch,
      }),
  );
  const { messages, sendMessage, status, error, clearError } = useChat({ transport });

  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const media = window.matchMedia("(max-width: 639px)");
    if (!media.matches) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, status, open]);

  useEffect(() => {
    for (const message of messages) {
      for (const part of message.parts) {
        if (!isToolPart(part) || part.type !== "tool-scroll_to") continue;
        if (part.state !== "output-available") continue;
        if (scrolledTools.current.has(part.toolCallId)) continue;
        scrolledTools.current.add(part.toolCallId);
        const output = part.output as { ok?: boolean; target?: string };
        if (!output?.ok || typeof output.target !== "string") continue;
        if (isCaseId(output.target)) {
          router.push(`/cases/${output.target}`);
          continue;
        }
        const elementId = resolveScrollElementId(output.target);
        if (!elementId) continue;
        if (pathname !== "/") {
          router.push(`/#${elementId}`);
          continue;
        }
        const element = document.getElementById(elementId);
        if (!element) continue;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        element.scrollIntoView({
          behavior: reduce ? "auto" : "smooth",
          block: "start",
        });
        element.classList.remove("target-flash");
        void element.offsetWidth;
        element.classList.add("target-flash");
      }
    }
  }, [messages, pathname, router]);

  function submit(text: string) {
    const value = text.trim();
    if (!value || busy) return;
    clearError();
    track("message_sent", { length: value.length });
    void sendMessage({ text: value });
    setDraft("");
  }

  function onPanelKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeChat();
      return;
    }
    if (event.key !== "Tab" || !panelRef.current) return;
    const focusable = panelRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }

  return (
    <>
      <button
        type="button"
        className={cn(
          "fixed right-5 bottom-5 z-40 inline-flex size-14 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-[0_8px_30px_rgba(0,0,0,0.18)]",
          open && "pointer-events-none invisible",
        )}
        aria-label={site.chat.fabLabel}
        aria-expanded={open}
        aria-controls="chat-panel"
        onClick={() => openChat("fab")}
      >
        <ChatIcon className="size-6" />
      </button>

      <div
        id="chat-panel"
        ref={panelRef}
        role={open ? "dialog" : undefined}
        aria-modal={open ? true : undefined}
        aria-hidden={!open}
        aria-labelledby="chat-title"
        inert={!open}
        onKeyDown={onPanelKeyDown}
        className={cn(
          "fixed z-50 flex flex-col bg-background",
          open
            ? "inset-0 sm:inset-auto sm:right-5 sm:bottom-5 sm:h-[min(640px,calc(100dvh-2.5rem))] sm:w-[24.5rem] sm:rounded-2xl sm:border sm:border-border sm:shadow-[0_16px_50px_rgba(0,0,0,0.28)]"
            : "hidden",
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-4">
          <div>
            <Tag>{site.chat.tag}</Tag>
            <h2 id="chat-title" className="mt-2 text-lg font-semibold tracking-tight">
              {site.chat.title}
            </h2>
          </div>
          <button
            type="button"
            className="inline-flex size-9 items-center justify-center rounded-full"
            aria-label={site.chat.closeLabel}
            onClick={closeChat}
          >
            <CloseIcon className="size-5" />
          </button>
        </div>

        <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
          {messages.length === 0 ? (
            <div>
              <p className="text-sm leading-relaxed text-muted">{site.chat.empty}</p>
              <ul className="mt-4 flex flex-col gap-2">
                {site.chat.suggestions.map((suggestion) => (
                  <li key={suggestion}>
                    <button
                      type="button"
                      className="w-full rounded-xl border border-border px-3 py-2 text-left text-sm hover:border-accent"
                      onClick={() => submit(suggestion)}
                    >
                      {suggestion}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {messages.map((message) => (
            <article
              key={message.id}
              className={cn(
                "max-w-[95%] rounded-xl px-3 py-2 text-sm leading-relaxed",
                message.role === "user"
                  ? "ml-auto bg-foreground text-background"
                  : "mr-auto border border-border",
              )}
            >
              {textFrom(message) ? (
                <p className="whitespace-pre-wrap">{textFrom(message)}</p>
              ) : null}
              {message.parts.map((part) => {
                if (!isToolPart(part) || part.type !== "tool-show_contact") return null;
                if (part.state !== "output-available") return null;
                const contact = readContactCard(part.output);
                if (!contact) return null;
                return <ContactCard key={part.toolCallId} contact={contact} />;
              })}
            </article>
          ))}

          {busy && messages.at(-1)?.role !== "assistant" ? (
            <p className="text-sm text-muted">{site.chat.typing}…</p>
          ) : null}
          {error ? (
            <p role="alert" className="rounded-xl border border-border px-3 py-2 text-sm text-foreground">
              {error.message}
            </p>
          ) : null}
        </div>

        <form
          className="border-t border-border p-3"
          onSubmit={(event) => {
            event.preventDefault();
            submit(draft);
          }}
        >
          <label htmlFor="chat-input" className="sr-only">
            {site.chat.inputLabel}
          </label>
          <div className="flex items-center gap-2 rounded-xl border border-border px-2">
            <input
              id="chat-input"
              ref={inputRef}
              value={draft}
              maxLength={2000}
              autoComplete="off"
              placeholder={site.chat.placeholder}
              className="h-11 min-w-0 flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-muted"
              onChange={(event) => setDraft(event.target.value)}
            />
            <button
              type="submit"
              className="inline-flex size-9 items-center justify-center rounded-lg bg-foreground text-background disabled:opacity-40"
              aria-label={site.chat.sendLabel}
              disabled={busy || draft.trim().length === 0}
            >
              <SendIcon className="size-4" />
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
