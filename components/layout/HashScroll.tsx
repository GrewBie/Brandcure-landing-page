"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const NAV_OFFSET = 76;

/** Scrolls to `location.hash` after client navigations (e.g. /portfolio → /#services). */
export function HashScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || hash.length < 2) return;

    const id = decodeURIComponent(hash.slice(1));
    const scrollToTarget = () => {
      const el = document.getElementById(id);
      if (!el) return;
      const top =
        el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    };

    // Wait for home sections to paint after route change.
    const t = window.setTimeout(scrollToTarget, 100);
    return () => window.clearTimeout(t);
  }, [pathname]);

  return null;
}
