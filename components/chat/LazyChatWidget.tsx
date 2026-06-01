"use client";

import { useChat } from "@/contexts/ChatContext";
import { cn } from "@/lib/cn";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";

const ChatWidget = dynamic(
  () =>
    import("@/components/chat/ChatWidget").then((m) => ({
      default: m.ChatWidget,
    })),
  { ssr: false, loading: () => null },
);

function ChatLauncher({
  badge,
  onActivate,
}: {
  badge: boolean;
  onActivate: () => void;
}) {
  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[500] flex flex-col items-end">
      <div className="pointer-events-auto relative ml-auto w-14">
        {badge && (
          <span className="animate-pop-in absolute -top-1 -right-1 z-[1] flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 border-cream bg-gold text-[9px] font-bold text-white">
            1
          </span>
        )}
        <button
          type="button"
          onClick={onActivate}
          className={cn(
            "flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border-none bg-charcoal font-serif text-xl text-white shadow-[0_8px_32px_rgba(0,0,0,0.24)] transition-all duration-[220ms] hover:scale-110 hover:rotate-[8deg] hover:bg-brand-black",
          )}
          title="Chat with Neha — voice call or text"
          aria-label="Open chat with Neha — voice or text"
        >
          ✦
        </button>
        <span className="pointer-events-none absolute -top-9 right-0 hidden whitespace-nowrap rounded-md bg-charcoal px-2 py-1 text-[10px] font-medium text-white shadow-md md:block">
          Chat · voice or type
        </span>
      </div>
    </div>
  );
}

/**
 * Neha chat/voice bundle loads only after the visitor interacts with the page
 * (pointer/keyboard) or taps the chat launcher — keeps TBT low on first paint.
 */
export function LazyChatWidget() {
  const { open, setOpen, badge, setBadge } = useChat();
  const [engaged, setEngaged] = useState(false);

  useEffect(() => {
    const engage = () => setEngaged(true);
    window.addEventListener("pointerdown", engage, { once: true, passive: true });
    window.addEventListener("keydown", engage, { once: true });
    return () => {
      window.removeEventListener("pointerdown", engage);
      window.removeEventListener("keydown", engage);
    };
  }, []);

  useEffect(() => {
    if (open) setEngaged(true);
  }, [open]);

  const activate = useCallback(() => {
    setEngaged(true);
    setOpen(true);
    setBadge(false);
  }, [setOpen, setBadge]);

  if (!engaged) {
    return <ChatLauncher badge={badge} onActivate={activate} />;
  }

  return <ChatWidget />;
}
