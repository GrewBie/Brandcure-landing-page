"use client";

import { browserNav } from "@/lib/browser-navigator";
import { summarizePortfolioItem } from "@/lib/portfolio/run-nav-command";
import type { NavItem } from "@/types/navigator";
import Image from "next/image";

export function CuratedPicksBar({
  items,
  catalog,
  onDismiss,
}: {
  items: NavItem[];
  catalog: NavItem[];
  onDismiss: () => void;
}) {
  if (items.length === 0) return null;

  return (
    <div className="border-t border-[var(--border)] bg-cream/60 p-3">
      <p className="m-0 mb-2 text-[10px] font-bold uppercase tracking-[0.1em] text-gold">
        Picked for you · {items.length} case studies
      </p>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <button
            key={item.navId}
            type="button"
            onClick={() => {
              summarizePortfolioItem(catalog, item.navId);
              if (item.videoUrl) {
                window.setTimeout(() => browserNav.playVideo(item.navId), 700);
              }
            }}
            className="flex cursor-pointer items-center gap-2.5 rounded-[10px] border border-[var(--border)] bg-warm-white p-2 text-left transition hover:border-gold/50"
          >
            <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md bg-cream">
              {item.posterUrl && (
                <Image
                  src={item.posterUrl}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="m-0 truncate text-[12px] font-semibold text-charcoal">
                {item.title}
              </p>
              <p className="m-0 truncate text-[10px] text-gray">{item.result}</p>
            </div>
            <span className="shrink-0 text-[10px] font-semibold text-gold">
              View →
            </span>
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="mt-2 w-full cursor-pointer rounded-[8px] border border-[var(--border-mid)] bg-transparent py-1.5 text-[11px] text-gray hover:text-charcoal"
      >
        Dismiss picks
      </button>
    </div>
  );
}
