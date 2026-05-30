import { getPortfolioProjects } from "@/lib/sanity/fetch";
import type { PortfolioProject } from "@/types/content";

/** Homepage portfolio — live Sanity CMS. */
export async function resolveHomePortfolioProjects(): Promise<PortfolioProject[]> {
  return getPortfolioProjects();
}

/** Portfolio page — live Sanity CMS. */
export async function resolvePortfolioProjects(): Promise<PortfolioProject[]> {
  return getPortfolioProjects();
}
