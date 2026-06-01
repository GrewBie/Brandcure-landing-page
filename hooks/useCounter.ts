"use client";

import { useEffect, useState } from "react";

export function useCounter(target: number, active: boolean, duration = 1700) {
  /** SSR / no-JS crawlers see the final stat value, not 0. */
  const [value, setValue] = useState(target);

  useEffect(() => {
    if (!active) return;
    const startVal = Math.max(1, Math.round(target * 0.8));
    if (startVal >= target) {
      setValue(target);
      return;
    }
    setValue(startVal);
    const start = Date.now();
    const tick = () => {
      const progress = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(startVal + eased * (target - startVal)));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [active, target, duration]);

  return value;
}
