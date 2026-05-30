"use client";

import { PortfolioWelcomeOverlay } from "@/components/portfolio/PortfolioWelcomeOverlay";
import { usePortfolioExperience } from "@/contexts/PortfolioExperienceContext";
import {
  PORTFOLIO_WELCOME_SEEN_KEY,
  markPortfolioAgentTour,
} from "@/lib/portfolio/portfolio-entry";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

/** Opens the AI vs manual overlay only for manual “See Our Work” entry — not Neha tours. */
export function PortfolioEntryGate() {
  const searchParams = useSearchParams();
  const { setShowWelcome, setMode, loadStoredMode } = usePortfolioExperience();

  useEffect(() => {
    loadStoredMode();
    const entry = searchParams.get("entry");

    if (entry === "agent") {
      markPortfolioAgentTour();
      setMode("ai");
      setShowWelcome(false);
      return;
    }

    if (entry !== "see-work") return;
    const seen = sessionStorage.getItem(PORTFOLIO_WELCOME_SEEN_KEY);
    if (!seen) setShowWelcome(true);
  }, [searchParams, setShowWelcome, setMode, loadStoredMode]);

  return <PortfolioWelcomeOverlay />;
}
