"use client";

import { browserNav } from "@/lib/browser-navigator";
import { cn } from "@/lib/cn";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

type Props = {
  url: string;
  title: string;
  posterUrl: string;
  /** Voice navigator id (slug) — opens live preview when agent plays. */
  navId?: string;
  className?: string;
  aspectClass?: string;
  imageSizes?: string;
};

export function WebsiteLivePreview({
  url,
  title,
  posterUrl,
  navId,
  className,
  aspectClass = "aspect-[16/10]",
  imageSizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
}: Props) {
  const [live, setLive] = useState(false);
  const [blocked, setBlocked] = useState(false);

  const openLive = useCallback(() => {
    setBlocked(false);
    setLive(true);
  }, []);

  const closeLive = useCallback(() => {
    setLive(false);
    setBlocked(false);
  }, []);

  useEffect(() => {
    if (!navId) return;
    return browserNav.registerPlayer(navId, {
      play: openLive,
      pause: closeLive,
    });
  }, [navId, openLive, closeLive]);

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-charcoal",
        aspectClass,
        className,
      )}
    >
      {!live ? (
        <>
          <Image
            src={posterUrl}
            alt={title}
            fill
            sizes={imageSizes}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
          <button
            type="button"
            onClick={openLive}
            aria-label={`Preview ${title} live in card`}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[rgba(17,18,20,0.28)] transition-colors hover:bg-[rgba(17,18,20,0.42)]"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold text-xl text-white shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
              ↗
            </span>
            <span className="rounded-full bg-charcoal/80 px-3 py-1 text-[10px] font-bold tracking-[0.08em] text-white">
              PREVIEW LIVE SITE
            </span>
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="absolute right-3 top-3 z-[1] rounded-full bg-warm-white/95 px-3 py-1.5 text-[10px] font-bold tracking-[0.06em] text-charcoal shadow-[0_4px_16px_rgba(0,0,0,0.18)] transition-colors hover:bg-gold hover:text-white"
          >
            OPEN ↗
          </a>
        </>
      ) : (
        <>
          {blocked ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 bg-cream p-6 text-center">
              <p className="text-sm text-charcoal">
                This site cannot be embedded here — open it in a new tab instead.
              </p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-charcoal px-4 py-2 text-[11px] font-semibold text-white hover:bg-brand-black"
              >
                Visit site ↗
              </a>
            </div>
          ) : (
            <iframe
              src={url}
              title={`Live preview — ${title}`}
              className="h-full w-full border-0 bg-white"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
              referrerPolicy="no-referrer-when-downgrade"
              onError={() => setBlocked(true)}
            />
          )}
          <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-2 bg-gradient-to-b from-[rgba(0,0,0,0.65)] to-transparent px-3 py-2">
            <button
              type="button"
              onClick={closeLive}
              className="rounded-full bg-warm-white/95 px-2.5 py-1 text-[10px] font-bold text-charcoal hover:bg-white"
            >
              ← Back to image
            </button>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-gold px-2.5 py-1 text-[10px] font-bold text-white hover:opacity-90"
            >
              Open full site ↗
            </a>
          </div>
        </>
      )}
    </div>
  );
}
