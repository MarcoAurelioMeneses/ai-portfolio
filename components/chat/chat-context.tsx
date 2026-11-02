"use client";

import {
  createContext,
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
  openChat: (source: ChatSource) => void;
  closeChat: () => void;
};

const ChatPanelContext = createContext<ChatPanelContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const returnFocus = useRef<HTMLElement | null>(null);
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

  const value: ChatPanelContextValue = {
    open,
    openChat(source) {
      if (!open) {
        returnFocus.current =
          document.activeElement instanceof HTMLElement ? document.activeElement : null;
        track("chat_opened", { source });
      }
      setOpen(true);
    },
    closeChat() {
      setOpen(false);
    },
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
