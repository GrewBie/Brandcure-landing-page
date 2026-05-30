"use client";

import { useAgent } from "@/contexts/AgentContext";
import { submitAgentLead, shouldSyncAgentLead } from "@/lib/submit-agent-lead";
import { useEffect, useRef } from "react";

/** Debounced Resend + Supabase lead sync from shared agent session memory. */
export function useAgentLeadSync() {
  const { session, messages } = useAgent();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncingRef = useRef(false);

  useEffect(() => {
    if (!shouldSyncAgentLead(session, messages)) return;

    const lastChannel = messages.at(-1)?.channel;
    const source = lastChannel === "voice" ? "voice" : "chat";

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (syncingRef.current) return;
      syncingRef.current = true;
      void submitAgentLead(session, messages, source).finally(() => {
        syncingRef.current = false;
      });
    }, 1200);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [session, messages]);
}
