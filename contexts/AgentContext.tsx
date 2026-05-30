"use client";

import {
  bumpTurn,
  createDefaultSession,
  loadMessages,
  loadSession,
  mergeSessionState,
  saveMessages,
  saveSession,
  sessionFromNavigatorCommand,
} from "@/lib/agent-state";
import type {
  AgentMessage,
  AgentSessionState,
  AgentStatePatch,
} from "@/types/agent-state";
import type { NavigatorCommand } from "@/types/navigator";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const WELCOME: AgentMessage = {
  role: "assistant",
  channel: "chat",
  at: new Date().toISOString(),
  content:
    "Hi! I'm Neha from BrandCure 👋\n\nTwo ways to talk:\n\n🎤 Voice — Tap the gold microphone at the bottom. It's like a quick phone call: speak, pause when you're done, and I'll answer out loud. I can also open our portfolio and play case-study videos on this page.\n\n⌨️ Type — Use the message box if you prefer text.\n\nWhat kind of business do you run, and which city are you in?",
};

type AgentContextValue = {
  session: AgentSessionState;
  messages: AgentMessage[];
  /** Append a user/assistant turn and persist. */
  recordTurn: (
    role: "user" | "assistant",
    content: string,
    channel: "chat" | "voice",
  ) => void;
  /** Merge partial session updates from API or heuristics. */
  patchSession: (patch: AgentStatePatch) => void;
  /** Apply voice command side-effects to session. */
  applyNavigatorCommand: (
    command: NavigatorCommand,
    catalogTitle?: string,
  ) => void;
  /** Sync scroll section / item index from the page. */
  syncNavPosition: (
    section: AgentSessionState["currentSection"],
    itemIndex: number,
  ) => void;
  resetSession: () => void;
};

const AgentContext = createContext<AgentContextValue | null>(null);

export function AgentProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AgentSessionState>(createDefaultSession);
  const [messages, setMessages] = useState<AgentMessage[]>([WELCOME]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = loadSession();
    const storedMessages = loadMessages();
    setSession(stored);
    setMessages(storedMessages.length > 0 ? storedMessages : [WELCOME]);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveSession(session);
  }, [session, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    saveMessages(messages);
  }, [messages, hydrated]);

  const patchSession = useCallback((patch: AgentStatePatch) => {
    setSession((s) => mergeSessionState(s, patch));
  }, []);

  const recordTurn = useCallback(
    (role: "user" | "assistant", content: string, channel: "chat" | "voice") => {
      const entry: AgentMessage = {
        role,
        content,
        channel,
        at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, entry].slice(-24));
      if (role === "user") {
        setSession((s) => bumpTurn(s));
      }
    },
    [],
  );

  const applyNavigatorCommand = useCallback(
    (command: NavigatorCommand, catalogTitle?: string) => {
      setSession((s) => sessionFromNavigatorCommand(s, command, catalogTitle));
    },
    [],
  );

  const syncNavPosition = useCallback(
    (section: AgentSessionState["currentSection"], itemIndex: number) => {
      setSession((s) => ({
        ...s,
        currentSection: section,
        currentItemIndex: itemIndex,
      }));
    },
    [],
  );

  const resetSession = useCallback(() => {
    const fresh = createDefaultSession();
    setSession(fresh);
    setMessages([{ ...WELCOME, at: new Date().toISOString() }]);
    saveSession(fresh);
    saveMessages([]);
  }, []);

  const value = useMemo(
    () => ({
      session,
      messages,
      recordTurn,
      patchSession,
      applyNavigatorCommand,
      syncNavPosition,
      resetSession,
    }),
    [
      session,
      messages,
      recordTurn,
      patchSession,
      applyNavigatorCommand,
      syncNavPosition,
      resetSession,
    ],
  );

  return (
    <AgentContext.Provider value={value}>{children}</AgentContext.Provider>
  );
}

export function useAgent() {
  const ctx = useContext(AgentContext);
  if (!ctx) throw new Error("useAgent must be used within AgentProvider");
  return ctx;
}
