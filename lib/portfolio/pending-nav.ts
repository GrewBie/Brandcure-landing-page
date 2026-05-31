import type { NavigatorSection } from "@/types/navigator";

const PENDING_NAV_KEY = "brandcure-pending-nav";

export type PendingNavAction = {
  type:
    | "highlight"
    | "play_video"
    | "scroll_to"
    | "open_detail"
    | "summarize_card"
    | "highlight_then_detail";
  navId?: string;
  section?: NavigatorSection;
};

export function setPendingNav(action: PendingNavAction): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PENDING_NAV_KEY, JSON.stringify(action));
}

export function consumePendingNav(): PendingNavAction | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(PENDING_NAV_KEY);
  if (!raw) return null;
  sessionStorage.removeItem(PENDING_NAV_KEY);
  try {
    return JSON.parse(raw) as PendingNavAction;
  } catch {
    return null;
  }
}

export function hasItemInDom(navId: string): boolean {
  if (typeof document === "undefined") return false;
  return Boolean(document.querySelector(`[data-nav-id="${navId}"]`));
}

export function scrollToHomePortfolio(): void {
  document.getElementById("portfolio")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}
