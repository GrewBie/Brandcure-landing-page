"use client";

import { useNavCatalog } from "@/contexts/NavCatalogContext";
import { buildNavCatalog } from "@/lib/portfolio-nav";
import type { PortfolioProject } from "@/types/content";
import { useEffect } from "react";

/**
 * Renders nothing. Pages mount this with their Sanity projects so the global
 * chat widget and voice orb get the current page's voice-navigable catalog.
 */
export function RegisterNavCatalog({
  projects,
}: {
  projects: PortfolioProject[];
}) {
  const { setCatalog } = useNavCatalog();

  useEffect(() => {
    setCatalog(buildNavCatalog(projects));
    return () => setCatalog([]);
  }, [projects, setCatalog]);

  return null;
}
