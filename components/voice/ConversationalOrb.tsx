"use client";

import { cn } from "@/lib/cn";
import type { VoiceState } from "@/hooks/useVoiceNavigator";

const BARS = 5;

export function ConversationalOrb({
  state,
  inCall = false,
  onClick,
  size = "lg",
}: {
  state: VoiceState;
  inCall?: boolean;
  onClick: () => void;
  size?: "md" | "lg";
}) {
  const dim = size === "lg" ? 88 : 64;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={inCall ? "End voice call" : "Start voice call with BrandCure AI"}
      className={cn(
        "el-orb-btn relative flex shrink-0 items-center justify-center rounded-full border-none bg-transparent p-0",
        `el-orb-state-${state}`,
        inCall && "el-orb-in-call",
      )}
      style={{ width: dim, height: dim }}
    >
      {/* Ripple rings */}
      <span className="el-orb-ring el-orb-ring-1" aria-hidden />
      <span className="el-orb-ring el-orb-ring-2" aria-hidden />
      <span className="el-orb-ring el-orb-ring-3" aria-hidden />

      {/* Glow */}
      <span className="el-orb-glow" aria-hidden />

      {/* Core sphere */}
      <span className="el-orb-core relative z-[2] flex h-[62%] w-[62%] items-center justify-center rounded-full">
        {(state === "listening" || state === "speaking" || (inCall && state === "idle")) && (
          <span className="el-orb-visualizer" aria-hidden>
            {Array.from({ length: BARS }).map((_, i) => (
              <span
                key={i}
                className="el-orb-bar"
                style={{ animationDelay: `${i * 0.12}s` }}
              />
            ))}
          </span>
        )}
        {state === "thinking" && (
          <span className="el-orb-dots" aria-hidden>
            <span />
            <span />
            <span />
          </span>
        )}
        {state === "idle" && (
          <span className="el-orb-icon" aria-hidden>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 14a3 3 0 0 0 3-3V7a3 3 0 1 0-6 0v4a3 3 0 0 0 3 3Z"
                fill="currentColor"
              />
              <path
                d="M19 11v1a7 7 0 0 1-14 0v-1"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
              <path
                d="M12 18v3"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </span>
        )}
        {(state === "denied" || state === "unsupported") && (
          <span className="text-lg text-white" aria-hidden>
            ⌨
          </span>
        )}
      </span>
    </button>
  );
}
