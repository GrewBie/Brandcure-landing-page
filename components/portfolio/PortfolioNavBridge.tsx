"use client";

import {
  PORTFOLIO_AGENT_NAV_EVENT,
  markPortfolioAgentTour,
} from "@/lib/portfolio/portfolio-entry";
import {
  CONTACT_NAV_EVENT,
  VOICE_NAV_EVENT,
  type VoiceNavDetail,
} from "@/lib/portfolio/voice-nav-events";
import { markContactFormFocus } from "@/lib/contact-capture";
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

    const goContact = () => {
      markContactFormFocus();
      const onHome = window.location.pathname === "/";
      if (!onHome) {
        router.push("/#contact");
        return;
      }
      if (window.location.hash !== "#contact") {
        router.push("/#contact");
      }
    };

    window.addEventListener(PORTFOLIO_AGENT_NAV_EVENT, goAgentPortfolio);
    window.addEventListener(VOICE_NAV_EVENT, onVoiceNav);
    window.addEventListener(CONTACT_NAV_EVENT, goContact);
    return () => {
      window.removeEventListener(PORTFOLIO_AGENT_NAV_EVENT, goAgentPortfolio);
      window.removeEventListener(VOICE_NAV_EVENT, onVoiceNav);
      window.removeEventListener(CONTACT_NAV_EVENT, goContact);
    };
  }, [router, setMode, setShowWelcome]);

  return null;
}
