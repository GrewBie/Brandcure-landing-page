"use client";

import { PortfolioWelcomeOverlay } from "@/components/portfolio/PortfolioWelcomeOverlay";
import { usePortfolioExperience } from "@/contexts/PortfolioExperienceContext";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

/** Opens the AI vs manual overlay when arriving from “See Our Work”. */
export function PortfolioEntryGate() {
  const searchParams = useSearchParams();
  const { setShowWelcome, loadStoredMode } = usePortfolioExperience();

  useEffect(() => {
    loadStoredMode();
    const entry = searchParams.get("entry");
    if (entry !== "see-work") return;
    const seen = sessionStorage.getItem("brandcure-portfolio-welcome-seen");
    if (!seen) setShowWelcome(true);
  }, [searchParams, setShowWelcome, loadStoredMode]);

  return <PortfolioWelcomeOverlay />;
}
