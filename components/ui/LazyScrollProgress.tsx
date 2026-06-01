"use client";

import dynamic from "next/dynamic";

export const ScrollProgress = dynamic(
  () =>
    import("@/components/ui/ScrollProgress").then((m) => ({
      default: m.ScrollProgress,
    })),
  { ssr: false, loading: () => null },
);
