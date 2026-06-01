"use client";

import { cn } from "@/lib/cn";
import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";

/** CSS-only reveal — avoids framer-motion on the critical path. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 26,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("reveal", visible && "reveal--visible", className)}
      style={
        {
          "--reveal-delay": `${delay}s`,
          "--reveal-y": `${y}px`,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}

export function RevealStagger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "reveal-stagger",
        visible && "reveal-stagger--visible",
        className,
      )}
    >
      {Children.map(children, (child, index) => {
        if (!isValidElement(child)) return child;
        const el = child as ReactElement<{
          className?: string;
          style?: React.CSSProperties;
        }>;
        return cloneElement(el, {
          className: cn(el.props.className, "reveal-stagger__item"),
          style: {
            ...el.props.style,
            ["--stagger-index" as string]: index,
          },
        });
      })}
    </div>
  );
}

/** @deprecated Use RevealStagger children with reveal-stagger__item — kept for import compatibility. */
export const staggerChild = {};
