"use client";

import dynamic from "next/dynamic";

export const CustomCursor = dynamic(
  () =>
    import("@/components/ui/CustomCursor").then((m) => ({
      default: m.CustomCursor,
    })),
  { ssr: false, loading: () => null },
);
