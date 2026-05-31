"use client";

import { consumeScrollLivePreview } from "@/lib/portfolio/voice-nav-events";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** After Neha opens a website detail page, scroll the live iframe into view. */
export function PortfolioDetailFocus() {
  const pathname = usePathname();

  useEffect(() => {
    if (!consumeScrollLivePreview()) return;

    const scroll = () => {
      document
        .getElementById("live-website-preview")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    const t = window.setTimeout(scroll, 450);
    return () => window.clearTimeout(t);
  }, [pathname]);

  return null;
}
