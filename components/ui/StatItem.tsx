"use client";

import { useCounter } from "@/hooks/useCounter";

export function StatItem({
  num,
  suffix,
  label,
  value,
  index,
  inView,
}: {
  num?: number;
  suffix?: string;
  label: string;
  /** When set, shows this instead of the animated number (e.g. "Flex"). */
  value?: string;
  index: number;
  inView: boolean;
}) {
  const count = useCounter(num ?? 0, inView && value == null, 1500 + index * 150);

  return (
    <div
      className="transition-all duration-[650ms] ease-out"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : "translateY(18px)",
        transitionDelay: `${index * 0.13}s`,
      }}
    >
      <div className="font-serif text-[44px] font-medium leading-none text-brand-black">
        {value ?? (
          <>
            {count}
            {suffix}
          </>
        )}
      </div>
      <div className="mt-2 text-[11px] tracking-[0.03em] text-gray">{label}</div>
    </div>
  );
}
