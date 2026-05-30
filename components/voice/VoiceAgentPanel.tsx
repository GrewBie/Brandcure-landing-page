"use client";

import { VoiceCommandInput } from "@/components/voice/VoiceCommandInput";
import { ConversationalOrb } from "@/components/voice/ConversationalOrb";
import type { AgentMessage } from "@/types/agent-state";
import type { VoiceState } from "@/hooks/useVoiceNavigator";
import { cn } from "@/lib/cn";
import { NEHA_DISPLAY_NAME } from "@/lib/voice/neha-intro";
import { useEffect, useRef } from "react";

function statusLabel(state: VoiceState, inCall: boolean): string {
  if (state === "idle") {
    return inCall
      ? "On call — say something when you're ready"
      : "Start a call, then speak naturally";
  }
  const map: Record<Exclude<VoiceState, "idle">, string> = {
    listening: "On call — listening…",
    thinking: "On call — thinking…",
    speaking: "On call — speaking…",
    denied: "Microphone blocked — use text below",
    unsupported: "Type your message below",
  };
  return map[state];
}

export function VoiceAgentPanel({
  open,
  onClose,
  state,
  inCall,
  transcript,
  agentSpeech,
  messages,
  showTextFallback,
  elevenLabsReady,
  onOrbClick,
  onStartCall,
  onEndCall,
  onSubmitText,
}: {
  open: boolean;
  onClose: () => void;
  state: VoiceState;
  inCall: boolean;
  transcript: string;
  agentSpeech: string;
  messages: AgentMessage[];
  showTextFallback: boolean;
  elevenLabsReady: boolean;
  onOrbClick: () => void;
  onStartCall: () => void;
  onEndCall: () => void;
  onSubmitText: (text: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, transcript, agentSpeech, state]);

  const recent = messages.slice(-10);
  const liveLine =
    state === "listening"
      ? transcript
      : state === "speaking" || state === "thinking"
        ? agentSpeech
        : "";

  return (
    <div
      className={cn(
        "pointer-events-none fixed bottom-6 left-4 right-4 z-[490] flex flex-col items-center gap-3 md:left-8 md:right-auto md:items-start",
        open && "el-panel-open",
      )}
    >
      <div
        className={cn(
          "el-voice-panel pointer-events-auto flex w-full max-w-[min(380px,calc(100vw-32px))] flex-col overflow-hidden transition-all duration-300 ease-out",
          open
            ? "max-h-[min(420px,55vh)] opacity-100 translate-y-0"
            : "max-h-0 opacity-0 translate-y-4 pointer-events-none",
        )}
        role="dialog"
        aria-label="BrandCure voice assistant"
        aria-hidden={!open}
      >
        <header className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] bg-charcoal px-4 py-3">
          <div>
            <p className="m-0 text-[13px] font-semibold text-white">
              {NEHA_DISPLAY_NAME}
            </p>
            <p className="m-0 mt-0.5 flex items-center gap-1.5 text-[11px] text-[rgba(255,255,255,0.5)]">
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  !inCall && state === "idle" && "bg-[rgba(255,255,255,0.35)]",
                  inCall && state === "idle" && "bg-gold animate-green-pulse",
                  state === "listening" && "bg-gold animate-green-pulse",
                  state === "thinking" && "bg-gold",
                  state === "speaking" && "bg-success animate-green-pulse",
                  (state === "denied" || state === "unsupported") &&
                    "bg-error",
                )}
              />
              {statusLabel(state, inCall)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {inCall ? (
              <button
                type="button"
                onClick={onEndCall}
                className="cursor-pointer rounded-lg border border-error/40 bg-error/15 px-2.5 py-1 text-[11px] font-semibold text-error hover:bg-error/25"
              >
                End call
              </button>
            ) : (
              !showTextFallback && (
                <button
                  type="button"
                  onClick={onStartCall}
                  className="cursor-pointer rounded-lg border border-gold/40 bg-gold/15 px-2.5 py-1 text-[11px] font-semibold text-gold hover:bg-gold/25"
                >
                  Start call
                </button>
              )
            )}
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-lg border-none bg-[rgba(255,255,255,0.08)] px-2.5 py-1 text-[18px] leading-none text-[rgba(255,255,255,0.5)] hover:bg-[rgba(255,255,255,0.14)] hover:text-white"
              aria-label="Minimize assistant"
            >
              ×
            </button>
          </div>
        </header>

        {!elevenLabsReady && (
          <p className="border-b border-error/20 bg-error/10 px-4 py-2 text-center text-[11px] leading-relaxed text-error">
            Add <code className="text-[10px]">ELEVENLABS_API_KEY</code> to{" "}
            <code className="text-[10px]">.env.local</code> for ElevenLabs
            voice — then restart the dev server.
          </p>
        )}

        <div
          ref={scrollRef}
          className="flex max-h-[min(280px,38vh)] flex-col gap-2.5 overflow-y-auto bg-[#1a1b1e] px-4 py-3"
        >
          {recent.length === 0 && (
            <p className="text-center text-[13px] leading-relaxed text-[rgba(255,255,255,0.45)]">
              {inCall
                ? "You're on a voice call — talk like you would on the phone. I'll listen after you pause."
                : 'Start a call and ask about our work — try "What do you do for restaurants?"'}
            </p>
          )}
          {recent.map((msg, i) => (
            <div
              key={`${msg.at}-${i}`}
              className={cn(
                "flex",
                msg.role === "user" ? "justify-end" : "justify-start",
              )}
            >
              <div
                className={cn(
                  "max-w-[88%] px-3.5 py-2.5 text-[13px] leading-[1.65]",
                  msg.role === "user"
                    ? "rounded-[16px_16px_4px_16px] bg-gold/90 text-brand-black"
                    : "rounded-[16px_16px_16px_4px] bg-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.92)]",
                )}
              >
                {msg.content}
                {msg.channel === "voice" && msg.role === "user" && (
                  <span className="mt-1 block text-[9px] uppercase tracking-[0.08em] opacity-60">
                    voice
                  </span>
                )}
              </div>
            </div>
          ))}

          {liveLine && !recent.some((m) => m.content === liveLine) && (
            <div
              className={cn(
                "flex",
                state === "listening" ? "justify-end" : "justify-start",
              )}
            >
              <div
                className={cn(
                  "max-w-[88%] px-3.5 py-2.5 text-[13px] leading-[1.65] italic",
                  state === "listening"
                    ? "rounded-[16px_16px_4px_16px] bg-gold/40 text-brand-black"
                    : "rounded-[16px_16px_16px_4px] bg-[rgba(196,162,106,0.15)] text-gold",
                )}
              >
                {liveLine}
                {state === "thinking" && (
                  <span className="el-typing-dots ml-1">…</span>
                )}
              </div>
            </div>
          )}
        </div>

        {showTextFallback && (
          <div className="border-t border-[rgba(255,255,255,0.08)] bg-[#1a1b1e] p-3">
            <VoiceCommandInput onSubmit={onSubmitText} />
          </div>
        )}

        <footer className="border-t border-[rgba(255,255,255,0.06)] bg-charcoal px-4 py-2 text-center text-[10px] tracking-[0.06em] text-[rgba(255,255,255,0.35)]">
          {inCall
            ? "ElevenLabs voice · pause ~1s when done · Space ends call"
            : "ElevenLabs voice · start call · Space to begin"}
        </footer>
      </div>

      <div className="pointer-events-auto flex items-center gap-3">
        <ConversationalOrb
          state={state}
          inCall={inCall}
          onClick={onOrbClick}
          size="lg"
        />
        {!open && (
          <span className="hidden rounded-full bg-charcoal/90 px-3 py-1.5 text-[12px] font-medium text-white shadow-lg backdrop-blur sm:inline">
            {inCall ? "On call with BrandCure" : "Call BrandCure AI"}
          </span>
        )}
      </div>
    </div>
  );
}
