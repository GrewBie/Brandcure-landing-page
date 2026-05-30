"use client";

import { useAgent } from "@/contexts/AgentContext";
import {
  leadSyncFingerprint,
  shouldSyncAgentLead,
  shouldSyncAgentLeadImmediately,
  submitAgentLead,
} from "@/lib/submit-agent-lead";
import { useEffect, useRef } from "react";

/** Syncs chat + voice leads to Supabase + team email when context is captured. */
export function useAgentLeadSync() {
  const { session, messages } = useAgent();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncingRef = useRef(false);
  const lastFingerprintRef = useRef("");

  useEffect(() => {
    if (!shouldSyncAgentLead(session, messages)) return;

    const fingerprint = leadSyncFingerprint(session);
    if (fingerprint === lastFingerprintRef.current) return;

    const lastChannel = messages.at(-1)?.channel;
    const source = lastChannel === "voice" ? "voice" : "chat";
    const immediate = shouldSyncAgentLeadImmediately(session, messages);
    const delayMs = immediate ? 350 : 1200;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (syncingRef.current) return;
      syncingRef.current = true;
      void submitAgentLead(session, messages, source)
        .then((ok) => {
          if (ok) lastFingerprintRef.current = fingerprint;
        })
        .finally(() => {
          syncingRef.current = false;
        });
    }, delayMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [session, messages]);
}
