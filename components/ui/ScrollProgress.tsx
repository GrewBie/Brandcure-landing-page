"use client";

import { useScrollY } from "@/hooks/useScrollY";
import { useEffect, useState } from "react";

export function ScrollProgress() {
  const scrollY = useScrollY();
  const [max, setMax] = useState(1);

  useEffect(() => {
    const update = () =>
      setMax(
        Math.max(
          1,
          document.documentElement.scrollHeight - window.innerHeight,
        ),
      );
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
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
