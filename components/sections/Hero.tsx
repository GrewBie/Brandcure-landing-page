"use client";

import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { StatItem } from "@/components/ui/StatItem";
import { siteSettings } from "@/lib/mock-data";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useScrollY } from "@/hooks/useScrollY";
import { useEffect, useRef, useState } from "react";

const stats = [
  { num: 3, suffix: "×", label: "faster with AI + a senior team" },
  { value: "24–48h", label: "free audit, no sales pitch" },
  { value: "~30 days", label: "to launch your new website" },
  { value: "Founder-led", label: "senior attention, every client" },
];

export function Hero() {
  const scrollY = useScrollY();
  const reducedMotion = useReducedMotion();
  const shapesRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsInView, setStatsInView] = useState(false);

  useEffect(() => {
    if (reducedMotion || !shapesRef.current) return;
    shapesRef.current.style.transform = `translateY(${scrollY * 0.42}px)`;
  }, [scrollY, reducedMotion]);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setStatsInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const headlineY = reducedMotion ? 0 : scrollY * 0.16;
  const headlineOpacity = reducedMotion ? 1 : Math.max(0, 1 - scrollY / 520);

  return (
    <section
      id="home"
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden section-padding pb-20 pt-[calc(76px+3.25rem)] md:pt-[calc(76px+4.25rem)]"
      aria-labelledby="hero-heading"
    >
      {/* Grid lines */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.028]"
        preserveAspectRatio="none"
        aria-hidden
      >
        {[1, 2, 3, 4].map((i) => (
          <line
            key={`v${i}`}
            x1={`${i * 20}%`}
            y1="0"
            x2={`${i * 20}%`}
            y2="100%"
            stroke="var(--charcoal)"
            strokeWidth="1"
          />
        ))}
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <line
            key={`h${i}`}
            x1="0"
            y1={`${i * 16.6}%`}
            x2="100%"
            y2={`${i * 16.6}%`}
            stroke="var(--charcoal)"
            strokeWidth="1"
          />
        ))}
      </svg>

      {/* Parallax shapes */}
      <div
        ref={shapesRef}
        className="pointer-events-none absolute inset-0 hidden will-change-transform lg:block"
        aria-hidden
      >
        <div
          className="absolute right-[-4%] top-1/2 -translate-y-1/2 select-none font-serif text-[clamp(240px,32vw,440px)] font-normal italic leading-none text-[rgba(42,44,48,0.038)] animate-float-a"
        >
          C
        </div>
        <svg
          className="absolute left-[6%] top-[15%] animate-spin-slow opacity-[0.12]"
          width="100"
          height="100"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="var(--gold)"
            strokeWidth="0.8"
            strokeDasharray="8 6"
          />
        </svg>
        <div className="absolute left-[11%] top-[21%] h-2.5 w-2.5 rounded-full bg-gold opacity-35 animate-float-b" />
        <div
          className="absolute right-[16%] top-[22%] h-[130px] w-px animate-float-c"
          style={{
            background:
              "linear-gradient(to bottom, transparent, rgba(42,44,48,0.12), transparent)",
          }}
        />
        <div className="absolute bottom-[24%] right-[20%] h-11 w-11 rotate-[22deg] border border-[rgba(42,44,48,0.1)] animate-float-a [animation-delay:2s]" />
        {Array.from({ length: 9 }, (_, i) => (
          <div
            key={i}
            className="absolute h-[3px] w-[3px] rounded-full bg-[var(--surface-muted)]"
            style={{
              left: `${61 + (i % 3) * 2.8}%`,
              top: `${70 + Math.floor(i / 3) * 2.8}%`,
              opacity: 0.07 + i * 0.015,
            }}
          />
        ))}
        <div
          className="absolute bottom-[30%] left-[5%] h-px w-[60px] animate-float-b opacity-40 [animation-delay:1s]"
          style={{
            background: "linear-gradient(to right, transparent, var(--gold))",
          }}
        />
      </div>

      <div className="container-main relative w-full">
        <div
          className="animate-fade-up max-w-[900px]"
          style={{
            transform: `translateY(${headlineY}px)`,
            opacity: headlineOpacity,
            willChange: "transform, opacity",
          }}
        >
          <div className="mb-9 inline-flex items-center gap-2 rounded-full bg-[var(--surface-muted-hover)] px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.1em] text-gray">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-green-pulse" />
            AI-FIRST GROWTH PARTNER · CHENNAI, INDIA
          </div>

          <h1
            id="hero-heading"
            className="mb-7 font-serif text-[clamp(3.25rem,8.5vw,6.75rem)] font-medium leading-[1.01] tracking-[-0.025em] text-brand-black"
          >
            Stop losing leads
            <br />
            <em className="font-medium italic text-gray">
              you already paid for.
            </em>
          </h1>

          <p className="mb-11 max-w-[540px] text-[clamp(15px,1.4vw,18px)] font-light leading-[1.8] text-gray">
            Every ad click, form fill, and WhatsApp message should turn into a
            booked job. We build your website, run your marketing, and automate
            the follow-up — so enquiries get replied to, qualified, and chased
            automatically. Live in about 30 days.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button href="#contact">Get a Free Audit →</Button>
            <Button
              href={`https://wa.me/${siteSettings.whatsappNumber}`}
              variant="secondary"
            >
              WhatsApp us
            </Button>
          </div>
        </div>

        <div
          ref={statsRef}
          className="mt-20 flex flex-wrap gap-10 border-t border-[var(--border)] pt-12 sm:gap-14"
        >
          {stats.map((stat, i) => (
            <StatItem key={stat.label} {...stat} index={i} inView={statsInView} />
          ))}
        </div>
      </div>
    </section>
  );
}
