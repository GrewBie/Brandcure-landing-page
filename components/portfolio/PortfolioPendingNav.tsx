"use client";

import { useNavCatalog } from "@/contexts/NavCatalogContext";
import { applyPendingNavAction } from "@/lib/portfolio/run-nav-command";
import { applyPendingHighlightThenDetail } from "@/lib/portfolio/voice-nav-sequence";
import { consumePendingNav } from "@/lib/portfolio/pending-nav";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/** After Neha navigates home → portfolio, finish highlight / play / scroll. */
export function PortfolioPendingNav() {
  const pathname = usePathname();
  const { catalog } = useNavCatalog();
  const ranRef = useRef(false);

  useEffect(() => {
    if (!pathname?.startsWith("/portfolio")) {
      ranRef.current = false;
      return;
    }
    if (catalog.length === 0 || ranRef.current) return;

    ranRef.current = true;
    const timer = window.setTimeout(async () => {
      const pending = consumePendingNav();
      if (pending?.type === "highlight_then_detail" && pending.navId) {
        await applyPendingHighlightThenDetail(catalog, pending);
        return;
      }
      if (pending) {
        applyPendingNavAction(catalog, pending);
      }
    }, 400);

    return () => window.clearTimeout(timer);
  }, [pathname, catalog]);

  return null;
}
