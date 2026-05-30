"use client";

import { AgentLeadSync } from "@/components/agent/AgentLeadSync";
import { ChatProvider } from "@/contexts/ChatContext";
import { AgentProvider } from "@/contexts/AgentContext";
import { NavCatalogProvider } from "@/contexts/NavCatalogContext";
import { PortfolioExperienceProvider } from "@/contexts/PortfolioExperienceContext";
import { HashScroll } from "@/components/layout/HashScroll";
import { CustomCursor } from "@/components/ui/CustomCursor";
import type { ReactNode } from "react";

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <NavCatalogProvider>
      <PortfolioExperienceProvider>
        <AgentProvider>
          <ChatProvider>
            <AgentLeadSync />
            <HashScroll />
            <CustomCursor />
            {children}
          </ChatProvider>
        </AgentProvider>
      </PortfolioExperienceProvider>
    </NavCatalogProvider>
  );
}
