"use client";

import { ClickToLoadEmbed } from "@/components/portfolio/ClickToLoadEmbed";
import { cn } from "@/lib/cn";

type Props = {
  url: string;
  title: string;
  className?: string;
  aspectClass?: string;
  /** Optional poster when no dedicated screenshot exists. */
  posterSrc?: string;
};

/** Live site preview — iframe loads only after user click. */
export function WebsiteLivePreview({
  url,
  title,
  className,
  aspectClass = "aspect-[16/10]",
  posterSrc = "/og-card.png",
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
      <ClickToLoadEmbed
        embedUrl={url}
        title={`Live site — ${title}`}
        posterSrc={posterSrc}
        posterAlt={`Preview of ${title}`}
        className="absolute inset-0 min-h-[320px]"
        playLabel="Load live site preview"
        footer={
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
        }
      />
    </div>
  );
}
