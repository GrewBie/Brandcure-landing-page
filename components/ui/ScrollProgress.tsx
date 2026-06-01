"use client";

import { useScrollY } from "@/hooks/useScrollY";
import { useEffect, useState } from "react";

export function ScrollProgress() {
  const scrollY = useScrollY();
  const [max, setMax] = useState(1);

  useEffect(() => {
    let rafId = 0;

    const update = () => {
      rafId = 0;
      setMax(
        Math.max(
          1,
          document.documentElement.scrollHeight - window.innerHeight,
        ),
      );
    };

    const schedule = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(update);
    };

    schedule();
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  const progress = Math.min(100, (scrollY / max) * 100);

  return (
    <div
      className="scroll-progress-bar fixed top-0 left-0 z-[201] h-[2.5px] transition-[width] duration-150 ease-linear"
      style={{ width: `${progress}%` }}
      aria-hidden
    />
  );
}
