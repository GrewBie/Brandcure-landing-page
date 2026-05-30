import {
  SECTION_ORDER,
  serviceTypeToSection,
} from "@/lib/portfolio-nav";
import type { NavigatorSection } from "@/types/navigator";
import type { PortfolioProject } from "@/types/content";

/** Homepage preview: N projects per pillar (websites, automations, creatives). */
export function pickMixedHomePortfolioPreview(
  projects: PortfolioProject[],
  perSection = 3,
): PortfolioProject[] {
  const buckets: Record<NavigatorSection, PortfolioProject[]> = {
    creatives: [],
    automations: [],
    websites: [],
  };

  for (const project of projects) {
    const section = serviceTypeToSection(project.serviceType);
    buckets[section].push(project);
  }

  const picked: PortfolioProject[] = [];
  for (const section of SECTION_ORDER) {
    picked.push(...buckets[section].slice(0, perSection));
  }
  return picked;
}
