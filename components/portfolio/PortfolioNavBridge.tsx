"use client";

import {
  PORTFOLIO_AGENT_NAV_EVENT,
  markPortfolioAgentTour,
} from "@/lib/portfolio/portfolio-entry";
import {
  VOICE_NAV_EVENT,
  type VoiceNavDetail,
} from "@/lib/portfolio/voice-nav-events";
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

    const onVoiceNav = (event: Event) => {
      const { type, navId } = (event as CustomEvent<VoiceNavDetail>).detail ?? {};
      if (type === "open_detail" && navId) {
        const path = `/portfolio/${navId}`;
        if (window.location.pathname !== path) {
          router.push(path);
        }
      }
    };

    window.addEventListener(PORTFOLIO_AGENT_NAV_EVENT, goAgentPortfolio);
    window.addEventListener(VOICE_NAV_EVENT, onVoiceNav);
    return () => {
      window.removeEventListener(PORTFOLIO_AGENT_NAV_EVENT, goAgentPortfolio);
      window.removeEventListener(VOICE_NAV_EVENT, onVoiceNav);
    };
  }, [router, setMode, setShowWelcome]);

  return null;
}
