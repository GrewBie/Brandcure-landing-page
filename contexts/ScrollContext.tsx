"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

const ScrollContext = createContext(0);

function readScrollY(): number {
  return Math.round(window.scrollY);
}

/** Single window scroll listener for the whole app. */
export function ScrollProvider({ children }: { children: ReactNode }) {
  const [y, setY] = useState(0);
  const latestRef = useRef(0);

  useEffect(() => {
    let rafId = 0;

    const commit = () => {
      rafId = 0;
      const next = readScrollY();
      if (next === latestRef.current) return;
      latestRef.current = next;
      setY(next);
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(commit);
    };

    latestRef.current = readScrollY();
    setY(latestRef.current);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <ScrollContext.Provider value={y}>{children}</ScrollContext.Provider>
  );
}

export function useScrollY(): number {
  return useContext(ScrollContext);
}
