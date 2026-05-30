"use client";

import { useChat } from "@/contexts/ChatContext";
import { usePortfolioExperience } from "@/contexts/PortfolioExperienceContext";
import { cn } from "@/lib/cn";

export function PortfolioWelcomeOverlay() {
  const { setOpen } = useChat();
  const { showWelcome, setShowWelcome, setMode, requestNehaIntro } =
    usePortfolioExperience();

  if (!showWelcome) return null;

  const chooseAi = () => {
    sessionStorage.setItem("brandcure-portfolio-welcome-seen", "1");
    setMode("ai");
    setShowWelcome(false);
    setOpen(true);
    requestNehaIntro();
  };

  const chooseManual = () => {
    sessionStorage.setItem("brandcure-portfolio-welcome-seen", "1");
    setMode("manual");
    setShowWelcome(false);
  };

  return (
    <div
      className="fixed inset-0 z-[600] flex items-center justify-center bg-brand-black/72 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal
      aria-labelledby="portfolio-welcome-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-[rgba(255,255,255,0.1)] bg-charcoal p-6 shadow-2xl sm:p-8">
        <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">
          BrandCure Portfolio
        </p>
        <h2
          id="portfolio-welcome-title"
          className="mt-2 font-serif text-[clamp(1.5rem,4vw,1.85rem)] font-medium leading-tight text-white"
        >
          How would you like to explore?
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[rgba(255,255,255,0.65)]">
          Meet <strong className="font-medium text-white">Neha</strong> in the
          chat — voice call, portfolio videos, and lead capture in one place. Or
          browse manually.
        </p>

        <div className="mt-7 flex flex-col gap-3">
          <button
            type="button"
            onClick={chooseAi}
            className={cn(
              "cursor-pointer rounded-xl border border-gold/50 bg-gold px-4 py-3.5 text-left transition hover:bg-gold/90",
            )}
          >
            <span className="block text-[15px] font-semibold text-brand-black">
              Talk to Neha (chat + voice)
            </span>
            <span className="mt-0.5 block text-[12px] text-brand-black/75">
              Opens chat → tap gold Talk to speak · Neha shows videos on this page
            </span>
          </button>
          <button
            type="button"
            onClick={chooseManual}
            className="cursor-pointer rounded-xl border border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.06)] px-4 py-3.5 text-left transition hover:bg-[rgba(255,255,255,0.1)]"
          >
            <span className="block text-[15px] font-semibold text-white">
              Browse only
            </span>
            <span className="mt-0.5 block text-[12px] text-[rgba(255,255,255,0.55)]">
              Scroll the portfolio — chat available anytime from the corner
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
