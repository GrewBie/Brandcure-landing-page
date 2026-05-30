"use client";

import { useAgent } from "@/contexts/AgentContext";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ChatContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  /** Shared conversation (same thread as voice). */
  messages: { role: "user" | "assistant"; content: string }[];
  openWithProject: (title: string) => void;
  badge: boolean;
  setBadge: (v: boolean) => void;
};

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { messages: agentMessages, recordTurn } = useAgent();
  const [open, setOpen] = useState(false);
  const [badge, setBadge] = useState(true);

  const messages = useMemo(
    () => agentMessages.map((m) => ({ role: m.role, content: m.content })),
    [agentMessages],
  );

  const openWithProject = useCallback(
    (title: string) => {
      recordTurn("user", `Tell me about the ${title} case study`, "chat");
      setOpen(true);
      setBadge(false);
    },
    [recordTurn],
  );

  const value = useMemo(
    () => ({
      open,
      setOpen,
      messages,
      openWithProject,
      badge,
      setBadge,
    }),
    [open, messages, openWithProject, badge],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}
