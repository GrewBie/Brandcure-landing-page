"use client";

import { browserNav } from "@/lib/browser-navigator";
import { cn } from "@/lib/cn";
import { useCallback, useEffect } from "react";

type Props = {
  url: string;
  title: string;
  navId?: string;
  className?: string;
  aspectClass?: string;
};

export function WebsiteLivePreview({
  url,
  title,
  navId,
  className,
  aspectClass = "aspect-[16/10]",
}: Props) {
  const focusLive = useCallback(() => {}, []);

  useEffect(() => {
    if (!navId) return;
    return browserNav.registerPlayer(navId, {
      play: focusLive,
      pause: () => {},
    });
  }, [navId, focusLive]);

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-white",
        aspectClass,
        className,
      )}
    >
      <iframe
        src={url}
        title={`Live site — ${title}`}
        className="h-full w-full border-0 bg-white"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
        referrerPolicy="no-referrer-when-downgrade"
        loading="eager"
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-end bg-gradient-to-b from-[rgba(0,0,0,0.4)] to-transparent px-3 py-2">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto rounded-full bg-gold px-2.5 py-1 text-[10px] font-bold text-white shadow-sm hover:opacity-90"
        >
          Open full site ↗
        </a>
      </div>
    </div>
  );
}
