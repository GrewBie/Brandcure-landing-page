"use client";

import { useAgentLeadSync } from "@/hooks/useAgentLeadSync";

/** Syncs chat + voice session memory to team email when enough context exists. */
export function AgentLeadSync() {
  useAgentLeadSync();
  return null;
}
