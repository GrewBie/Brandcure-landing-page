"use client";

import {
  PORTFOLIO_AGENT_NAV_EVENT,
  markPortfolioAgentTour,
} from "@/lib/portfolio/portfolio-entry";
import { usePortfolioExperience } from "@/contexts/PortfolioExperienceContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Client-side portfolio navigation for Neha (no full reload — keeps voice call alive).
 */
export function PortfolioNavBridge() {
  const router = useRouter();
  const { setMode, setShowWelcome } = usePortfolioExperience();

  useEffect(() => {
    const goAgentPortfolio = () => {
      markPortfolioAgentTour();
      setMode("ai");
      setShowWelcome(false);

      if (!window.location.pathname.startsWith("/portfolio")) {
        router.push("/portfolio?entry=agent");
      }
    };

    window.addEventListener(PORTFOLIO_AGENT_NAV_EVENT, goAgentPortfolio);
    return () =>
      window.removeEventListener(PORTFOLIO_AGENT_NAV_EVENT, goAgentPortfolio);
  }, [router, setMode, setShowWelcome]);

  return null;
}
