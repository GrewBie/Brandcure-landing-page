"use client";

import { useEffect, useState } from "react";

export function useCounter(target: number, active: boolean, duration = 1700) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    const start = Date.now();
    const tick = () => {
      const progress = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [active, target, duration]);

  return value;
}
