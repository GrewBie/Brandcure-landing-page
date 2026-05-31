"use client";

import { cn } from "@/lib/cn";

type Props = {
  url: string;
  title: string;
  className?: string;
  aspectClass?: string;
};

/** Full live-site iframe — used on the portfolio detail page only. */
export function WebsiteLivePreview({
  url,
  title,
  className,
  aspectClass = "aspect-[16/10]",
}: Props) {
  return (
    <div
      id="live-website-preview"
      className={cn(
        "relative overflow-hidden rounded-lg border border-[var(--border)] bg-white",
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
          className="pointer-events-auto rounded-full bg-gold px-3 py-1.5 text-[11px] font-bold text-white shadow-sm hover:opacity-90"
        >
          Open full site ↗
        </a>
      </div>
    </div>
  );
}
