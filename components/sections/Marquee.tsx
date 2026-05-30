import { marqueeItems } from "@/lib/mock-data";

export function Marquee() {
  const items = [...marqueeItems, ...marqueeItems];

  return (
    <div className="overflow-hidden bg-charcoal py-[15px]" aria-hidden>
      <div className="marquee-track flex w-max select-none">
        {items.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="inline-flex items-center gap-[22px] whitespace-nowrap px-[26px] text-[11px] font-semibold tracking-[0.1em] text-[rgba(255,255,255,0.45)]"
          >
            {item}
            <span className="text-[10px] text-gold">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
