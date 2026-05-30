"use client";

import { PORTFOLIO_MODE_KEY } from "@/lib/portfolio/portfolio-entry";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type PortfolioTourMode = "ai" | "manual" | null;

type PortfolioExperienceContextValue = {
  mode: PortfolioTourMode;
  setMode: (mode: PortfolioTourMode) => void;
  showWelcome: boolean;
  setShowWelcome: (open: boolean) => void;
  /** Bumps when AI-guided tour should play the Neha intro + start call. */
  introRequestId: number;
  requestNehaIntro: () => void;
  loadStoredMode: () => void;
};

const PortfolioExperienceContext =
  createContext<PortfolioExperienceContextValue | null>(null);

export function PortfolioExperienceProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [mode, setModeState] = useState<PortfolioTourMode>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [introRequestId, setIntroRequestId] = useState(0);

  const setMode = useCallback((next: PortfolioTourMode) => {
    setModeState(next);
    if (typeof window !== "undefined") {
      if (next) sessionStorage.setItem(PORTFOLIO_MODE_KEY, next);
      else sessionStorage.removeItem(PORTFOLIO_MODE_KEY);
    }
  }, []);

  const loadStoredMode = useCallback(() => {
    if (typeof window === "undefined") return;
    const stored = sessionStorage.getItem(PORTFOLIO_MODE_KEY);
    if (stored === "ai" || stored === "manual") {
      setModeState(stored);
    }
  }, []);

  const requestNehaIntro = useCallback(() => {
    setIntroRequestId((n) => n + 1);
  }, []);

  const value = useMemo(
    () => ({
      mode,
      setMode,
      showWelcome,
      setShowWelcome,
      introRequestId,
      requestNehaIntro,
      loadStoredMode,
    }),
    [
      mode,
      setMode,
      showWelcome,
      introRequestId,
      requestNehaIntro,
      loadStoredMode,
    ],
  );

  return (
    <PortfolioExperienceContext.Provider value={value}>
      {children}
    </PortfolioExperienceContext.Provider>
  );
}

export function usePortfolioExperience() {
  const ctx = useContext(PortfolioExperienceContext);
  if (!ctx) {
    throw new Error(
      "usePortfolioExperience must be used within PortfolioExperienceProvider",
    );
  }
  return ctx;
}
