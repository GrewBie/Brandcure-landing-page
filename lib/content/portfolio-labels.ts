import type {
  PortfolioAutomationSubtype,
  PortfolioSegment,
  PortfolioServiceType,
} from "@/types/content";

export const PORTFOLIO_SERVICE_TYPES: {
  value: PortfolioServiceType;
  title: string;
}[] = [
  { value: "automation", title: "AI & Agentic Automation" },
  { value: "websites", title: "Websites" },
  { value: "ai-ads", title: "AI Ads (Video)" },
];

export const PORTFOLIO_AUTOMATION_SUBTYPES: {
  value: PortfolioAutomationSubtype;
  title: string;
}[] = [
  { value: "ai-automation", title: "AI Automation" },
  { value: "agentic-automation", title: "Agentic Automation" },
];

export const PORTFOLIO_SEGMENTS: {
  value: PortfolioSegment;
  title: string;
}[] = [
  { value: "smb", title: "Indian SMB" },
  { value: "startup", title: "Startup" },
  { value: "d2c", title: "D2C" },
  { value: "global", title: "Global" },
];

export const SERVICE_TYPE_LABEL: Record<PortfolioServiceType, string> =
  Object.fromEntries(
    PORTFOLIO_SERVICE_TYPES.map((s) => [s.value, s.title]),
  ) as Record<PortfolioServiceType, string>;

export const SEGMENT_LABEL: Record<PortfolioSegment, string> =
  Object.fromEntries(
    PORTFOLIO_SEGMENTS.map((s) => [s.value, s.title]),
  ) as Record<PortfolioSegment, string>;

export const AUTOMATION_SUBTYPE_LABEL: Record<
  PortfolioAutomationSubtype,
  string
> = Object.fromEntries(
  PORTFOLIO_AUTOMATION_SUBTYPES.map((s) => [s.value, s.title]),
) as Record<PortfolioAutomationSubtype, string>;
