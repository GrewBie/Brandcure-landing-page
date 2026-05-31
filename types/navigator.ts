import type { AgentStatePatch } from "@/types/agent-state";
import type { VideoProvider } from "@/lib/video/embed";

/** Voice-navigable portfolio sections (brief terms). */
export type NavigatorSection = "creatives" | "automations" | "websites";

/** A single voice-navigable item derived from a Sanity portfolio project. */
export type NavItem = {
  /** Stable id used in data-nav-id (the project slug). */
  navId: string;
  navSection: NavigatorSection;
  title: string;
  /** Short result/benefit line for narration. */
  result: string;
  slug: string;
  /** DOM id of an associated video element/card, when present. */
  videoId?: string;
  /** Source video URL (youtube/vimeo/file) when present. */
  videoUrl?: string;
  videoProvider?: VideoProvider;
  /** Poster / preview image. */
  posterUrl: string;
  /** Client segment label, e.g. "D2C". */
  industry: string;
  /** Type-specific detail for Neha (website copy, ROI, ad description). */
  agentSummary?: string;
  /** Live client site URL (websites section). */
  websiteUrl?: string;
  /** Lowercased keywords for matching (title, tags, segment, subtitle words). */
  keywords: string[];
};

/** Commands the agent can ask the browser to execute. */
export type NavigatorCommandType =
  | "scroll_to"
  | "highlight"
  | "play_video"
  | "next_item"
  | "prev_item"
  | "show_all"
  | "filter_industry"
  | "speak_only"
  | "open_portfolio"
  | "dismiss_spotlight"
  | "capture_lead"
  | "open_audit"
  | "open_detail"
  | "open_website"
  | "summarize_card";

export type NavigatorCommand = {
  command: NavigatorCommandType;
  /** Target section for scroll_to / show_all. */
  section?: NavigatorSection;
  /** Target nav id (slug) for highlight / play_video. */
  navId?: string;
  /** Industry/segment value for filter_industry. */
  industry?: string;
  /** Always present — spoken back to the user via TTS. */
  speech: string;
  /** Optional session memory to persist after this command. */
  stateUpdate?: AgentStatePatch;
};

export type NavigatorMessage = {
  role: "user" | "assistant";
  content: string;
};
