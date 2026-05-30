import { getVideoProvider } from "@/lib/video/embed";
import type { NavItem, NavigatorSection } from "@/types/navigator";
import type { PortfolioProject, PortfolioServiceType } from "@/types/content";

/** Brief section term -> existing Sanity serviceType. */
export function sectionToServiceType(
  section: NavigatorSection,
): PortfolioServiceType {
  switch (section) {
    case "creatives":
      return "ai-ads";
    case "automations":
      return "automation";
    case "websites":
      return "websites";
  }
}

/** Existing Sanity serviceType -> brief section term. */
export function serviceTypeToSection(
  serviceType: PortfolioServiceType,
): NavigatorSection {
  switch (serviceType) {
    case "ai-ads":
      return "creatives";
    case "automation":
      return "automations";
    case "websites":
      return "websites";
  }
}

export const SECTION_ORDER: NavigatorSection[] = [
  "creatives",
  "automations",
  "websites",
];

export const SECTION_LABEL: Record<NavigatorSection, string> = {
  creatives: "AI Creatives",
  automations: "Business Automations",
  websites: "Website Portfolio",
};

/** Stable DOM id for a project's video element/card. */
export function videoDomId(slug: string): string {
  return `video-${slug}`;
}

function deriveKeywords(project: PortfolioProject): string[] {
  const raw = [
    project.title,
    project.subtitle,
    project.segmentLabel,
    project.serviceTypeLabel,
    project.automationSubtypeLabel ?? "",
    ...project.tags,
  ]
    .join(" ")
    .toLowerCase();

  const words = raw
    .split(/[^a-z0-9]+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 2);

  return Array.from(new Set(words));
}

/** Picks the best preview video URL for a project across its media. */
function previewVideoFor(
  project: PortfolioProject,
): { url?: string } {
  if (project.previewVideoUrl) return { url: project.previewVideoUrl };
  if (project.serviceType === "ai-ads" && project.adVideos?.length) {
    return { url: project.adVideos[0]?.videoUrl };
  }
  if (project.serviceType === "automation" && project.demoVideoUrl) {
    return { url: project.demoVideoUrl };
  }
  return {};
}

/** Derives the voice-navigable catalog from published Sanity projects. */
export function buildNavCatalog(projects: PortfolioProject[]): NavItem[] {
  return projects.map((project) => {
    const navSection = serviceTypeToSection(project.serviceType);
    const { url } = previewVideoFor(project);
    const hasVideo = Boolean(url);

    return {
      navId: project.slug,
      navSection,
      title: project.title,
      result: project.resultHeadline,
      slug: project.slug,
      videoId: hasVideo ? videoDomId(project.slug) : undefined,
      videoUrl: url,
      videoProvider: url ? getVideoProvider(url) : undefined,
      posterUrl: project.heroImageUrl,
      industry: project.segmentLabel,
      keywords: deriveKeywords(project),
    };
  });
}

/** Compact text list of projects for an LLM system prompt. */
export function catalogToPromptList(catalog: NavItem[]): string {
  if (catalog.length === 0) return "(no projects published yet)";
  return catalog
    .map(
      (item) =>
        `- navId="${item.navId}" | section=${item.navSection} | "${item.title}" (${item.industry}) — ${item.result}${item.videoUrl ? " [has video]" : ""}`,
    )
    .join("\n");
}
