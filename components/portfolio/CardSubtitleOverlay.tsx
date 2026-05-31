"use client";

import { cn } from "@/lib/cn";
import { useLayoutEffect, useRef } from "react";

const MIN_PX = 11;
const MAX_PX = 18;

/** Solid overlay — subtitle only, auto-sized to fit the image area. */
export function CardSubtitleOverlay({
  subtitle,
  className,
}: {
  subtitle: string;
  className?: string;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const box = boxRef.current;
    const text = textRef.current;
    if (!box || !text || !subtitle.trim()) return;

    const fit = () => {
      let size = MAX_PX;
      text.style.fontSize = `${size}px`;
      text.style.lineHeight = "1.35";

      const maxW = box.clientWidth;
      const maxH = box.clientHeight;

      while (
        size > MIN_PX &&
        (text.scrollHeight > maxH || text.scrollWidth > maxW)
      ) {
        size -= 1;
        text.style.fontSize = `${size}px`;
      }
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    return () => ro.disconnect();
  }, [subtitle]);

  if (!subtitle.trim()) return null;

  return (
    <div
      ref={boxRef}
      className={cn(
        "absolute inset-0 z-[15] flex items-center justify-center bg-charcoal p-5",
        className,
      )}
    >
      <p
        ref={textRef}
        className="m-0 max-h-full max-w-full overflow-hidden text-center font-medium text-white"
        style={{ fontSize: `${MAX_PX}px`, lineHeight: 1.35 }}
      >
        {subtitle}
      </p>
    </div>
  );
}
