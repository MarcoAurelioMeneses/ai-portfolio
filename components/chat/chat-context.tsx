"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { track } from "@/lib/analytics";

type ChatSource = "fab" | "hero";

type ChatPanelContextValue = {
  open: boolean;
  questionVersion: number;
  openChat: (source: ChatSource) => void;
  closeChat: () => void;
  ask: (text: string) => void;
  takeQuestion: () => string | null;
};

const ChatPanelContext = createContext<ChatPanelContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [questionVersion, setQuestionVersion] = useState(0);
  const returnFocus = useRef<HTMLElement | null>(null);
  const questionRef = useRef<string | null>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      return;
    }
    if (!wasOpen.current) return;
    wasOpen.current = false;
    returnFocus.current?.focus();
    returnFocus.current = null;
  }, [open]);

  const takeQuestion = useCallback(() => {
    const valueText = questionRef.current;
    questionRef.current = null;
    return valueText;
  }, []);

  function openChat(source: ChatSource) {
    if (!open) {
      returnFocus.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      track("chat_opened", { source });
    }
    setOpen(true);
  }

  const value: ChatPanelContextValue = {
    open,
    questionVersion,
    openChat,
    closeChat() {
      setOpen(false);
    },
    ask(text: string) {
      const valueText = text.trim();
      if (!valueText) return;
      questionRef.current = valueText;
      setQuestionVersion((version) => version + 1);
      openChat("hero");
    },
    takeQuestion,
  };

  return <ChatPanelContext.Provider value={value}>{children}</ChatPanelContext.Provider>;
}

export function useChatPanel(): ChatPanelContextValue {
  const value = useContext(ChatPanelContext);
  if (!value) {
    throw new Error("useChatPanel must be used within ChatProvider");
  }
  return value;
}
