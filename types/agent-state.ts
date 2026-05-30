import type { NavigatorSection } from "@/types/navigator";

/** Where the visitor is in the sales / discovery journey. */
export type LeadStage =
  | "browsing"
  | "exploring"
  | "qualifying"
  | "ready"
  | "captured";

/** Shared session memory for chat + voice agents. */
export type AgentSessionState = {
  /** Visitor's name once known. */
  name?: string;
  /** WhatsApp / phone when shared. */
  phone?: string;
  business?: string;
  city?: string;
  /** Primary pain point or goal they mentioned. */
  challenge?: string;
  /** Best-fit service pillar based on conversation. */
  interest?: NavigatorSection | "unknown";
  leadStage: LeadStage;
  /** Portfolio slug last highlighted or discussed. */
  lastProjectNavId?: string;
  /** Human-readable title of last project. */
  lastProjectTitle?: string;
  /** Current portfolio section the user is viewing. */
  currentSection?: NavigatorSection;
  /** Index within section for next/prev navigation. */
  currentItemIndex: number;
  /** Active industry filter on websites section, if any. */
  activeIndustryFilter?: string;
  /** Total user turns this session (for pacing tone). */
  turnCount: number;
  /** How many distinct portfolio cards Neha has spotlighted this session. */
  projectsPresentedCount?: number;
  /** Slugs already presented (avoid repeating the same case study). */
  presentedNavIds?: string[];
  /** ISO timestamp of last interaction. */
  lastActiveAt: string;
};

export type AgentMessage = {
  role: "user" | "assistant";
  content: string;
  /** Which surface sent/received this turn. */
  channel: "chat" | "voice";
  at: string;
};

export type AgentStatePatch = Partial<
  Omit<AgentSessionState, "turnCount" | "lastActiveAt">
>;
