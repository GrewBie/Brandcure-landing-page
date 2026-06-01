"use client";

import { cn } from "@/lib/cn";
import { useState } from "react";

type LazyDriveEmbedProps = {
  fileId: string;
  title: string;
  className?: string;
  footer?: React.ReactNode;
};

/** Google Drive preview — iframe loads only after explicit user click. */
export function LazyDriveEmbed({
  fileId,
  title,
  className,
  footer,
}: LazyDriveEmbedProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-[var(--brand-black)]",
        !loaded && "aspect-video",
        className,
      )}
    >
      {loaded ? (
        <iframe
          src={`https://drive.google.com/file/d/${fileId}/preview`}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          loading="lazy"
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setLoaded(true)}
          className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center bg-[#111]"
          aria-label={`Click to load video — ${title}`}
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(255,255,255,0.15)]">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="white"
              aria-hidden
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
          <p className="absolute inset-x-0 bottom-3 text-center text-xs text-[rgba(255,255,255,0.65)]">
            Click to load video
          </p>
        </button>
      )}
      {footer}
    </div>
  );
}
