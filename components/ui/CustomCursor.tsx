"use client";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useEffect, useState } from "react";

export function CustomCursor() {
  const reduced = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [pos, setPos] = useState({ x: -200, y: -200 });
  const [hover, setHover] = useState(false);

  useEffect(() => {
    if (reduced) return;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (coarse) return;

    setEnabled(true);
    document.body.classList.add("custom-cursor-active");

    const onMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      setHover(
        !!t.closest("a, button, [role='button'], input, textarea, select, label"),
      );
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    return () => {
      document.body.classList.remove("custom-cursor-active");
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
    };
  }, [reduced]);

  if (reduced || !enabled) return null;

  const size = hover ? 34 : 6;
  const offset = hover ? 17 : 3;

  return (
    <div
      className="pointer-events-none fixed top-0 left-0 z-[9999] mix-blend-multiply"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: hover ? "transparent" : "var(--charcoal)",
        border: hover ? "1.5px solid var(--charcoal)" : "none",
        transform: `translate(${pos.x - offset}px, ${pos.y - offset}px)`,
        transition:
          "width 0.28s ease, height 0.28s ease, background 0.28s ease, border 0.28s ease",
      }}
      aria-hidden
    />
  );
}
