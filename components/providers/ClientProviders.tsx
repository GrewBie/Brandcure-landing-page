"use client";

import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ChatProvider } from "@/contexts/ChatContext";
import { AgentProvider } from "@/contexts/AgentContext";
import { NavCatalogProvider } from "@/contexts/NavCatalogContext";
import { PortfolioNavBridge } from "@/components/portfolio/PortfolioNavBridge";
import { PortfolioDetailFocus } from "@/components/portfolio/PortfolioDetailFocus";
import { PortfolioPendingNav } from "@/components/portfolio/PortfolioPendingNav";
import { PortfolioExperienceProvider } from "@/contexts/PortfolioExperienceContext";
import { HashScroll } from "@/components/layout/HashScroll";
import { CustomCursor } from "@/components/ui/CustomCursor";
import type { ReactNode } from "react";

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <NavCatalogProvider>
        <PortfolioExperienceProvider>
          <PortfolioNavBridge />
          <PortfolioPendingNav />
          <PortfolioDetailFocus />
          <AgentProvider>
            <ChatProvider>
              <HashScroll />
              <CustomCursor />
              {children}
            </ChatProvider>
          </AgentProvider>
        </PortfolioExperienceProvider>
      </NavCatalogProvider>
    </ThemeProvider>
  );
}
