"use client";

import { browserNav } from "@/lib/browser-navigator";
import type { NavItem } from "@/types/navigator";
import Image from "next/image";
import { useEffect } from "react";

const AUTO_DISMISS_MS = 12_000;

export function VideoSuggestionCard({
  item,
  onDismiss,
}: {
  item: NavItem;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const watch = () => {
    browserNav.scrollToSection(item.navSection);
    browserNav.highlightItem(item.navId);
    if (item.videoUrl) browserNav.playVideo(item.navId);
    onDismiss();
  };

  return (
    <div className="suggestion-card pointer-events-auto overflow-hidden rounded-[14px] border border-[var(--border)] bg-warm-white shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
      <div className="flex gap-3 p-3">
        <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-cream">
          {item.posterUrl && (
            <Image
              src={item.posterUrl}
              alt={item.title}
              fill
              sizes="96px"
              className="object-cover"
            />
          )}
          <span className="absolute inset-0 flex items-center justify-center text-white">
            ▶
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-gold">
            Suggested · {item.industry}
          </p>
          <p className="truncate text-[13px] font-semibold text-charcoal">
            {item.title}
          </p>
          <p className="truncate text-[11px] text-gray">{item.result}</p>
        </div>
      </div>
      <div className="flex gap-2 border-t border-[var(--border)] p-2.5">
        <button
          type="button"
          onClick={watch}
          className="flex-1 cursor-pointer rounded-[8px] border-none bg-charcoal px-3 py-2 text-[12px] font-semibold text-white hover:bg-brand-black"
        >
          Watch it
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="cursor-pointer rounded-[8px] border border-[var(--border-mid)] bg-transparent px-3 py-2 text-[12px] font-medium text-charcoal hover:bg-[rgba(42,44,48,0.06)]"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
