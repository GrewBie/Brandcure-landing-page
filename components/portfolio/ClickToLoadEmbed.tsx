"use client";

import { LazyDriveEmbed } from "@/components/portfolio/LazyDriveEmbed";
import { cn } from "@/lib/cn";
import { extractGoogleDriveFileId } from "@/lib/video/embed";
import Image from "next/image";
import { useState } from "react";

type ClickToLoadEmbedProps = {
  embedUrl: string;
  title: string;
  posterSrc: string;
  posterAlt: string;
  className?: string;
  allow?: string;
  playLabel?: string;
  footer?: React.ReactNode;
};

function GenericClickToLoadEmbed({
  embedUrl,
  title,
  posterSrc,
  posterAlt,
  className,
  allow = "autoplay; fullscreen; picture-in-picture",
  playLabel = "Play preview",
  footer,
}: ClickToLoadEmbedProps) {
  const [active, setActive] = useState(false);

  if (active) {
    return (
      <div className={cn("relative h-full w-full", className)}>
        <iframe
          src={embedUrl}
          title={title}
          allow={allow}
          allowFullScreen
          loading="lazy"
          className="absolute inset-0 h-full w-full border-0"
        />
        {footer}
      </div>
    );
  }

  return (
    <div className={cn("relative h-full w-full", className)}>
      <Image
        src={posterSrc}
        alt={posterAlt}
        fill
        sizes="(max-width: 1200px) 100vw, 960px"
        className="object-cover"
      />
      <button
        type="button"
        onClick={() => setActive(true)}
        className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[rgba(17,18,20,0.42)] transition-colors hover:bg-[rgba(17,18,20,0.55)]"
        aria-label={`${playLabel} — ${title}`}
      >
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gold text-2xl text-white shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
          ▶
        </span>
        <span className="text-[11px] font-semibold tracking-[0.08em] text-white">
          {playLabel}
        </span>
      </button>
      {footer}
    </div>
  );
}

/** Defers heavy iframes until the user opts in — Drive uses LazyDriveEmbed. */
export function ClickToLoadEmbed(props: ClickToLoadEmbedProps) {
  const driveId = extractGoogleDriveFileId(props.embedUrl);
  if (driveId) {
    return (
      <LazyDriveEmbed
        fileId={driveId}
        title={props.title}
        className={props.className}
        footer={props.footer}
      />
    );
  }
  return <GenericClickToLoadEmbed {...props} />;
}
