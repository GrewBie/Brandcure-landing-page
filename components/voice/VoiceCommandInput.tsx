"use client";

import { useState } from "react";

const SHORTCUTS = [
  "Show me the AI ads",
  "Play the first video",
  "Show automations",
  "Book a free audit",
];

export function VoiceCommandInput({
  onSubmit,
}: {
  onSubmit: (text: string) => void;
}) {
  const [value, setValue] = useState("");

  const submit = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setValue("");
  };

  return (
    <div className="flex flex-col gap-2">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(value);
        }}
        className="flex gap-2"
      >
        <label htmlFor="voice-text" className="sr-only">
          Type a command
        </label>
        <input
          id="voice-text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type your message…"
          className="min-h-[40px] flex-1 rounded-[10px] border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.06)] px-3 text-[13px] text-white placeholder:text-[rgba(255,255,255,0.35)] focus:border-gold focus:outline-none"
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className="cursor-pointer rounded-[10px] border-none bg-charcoal px-3.5 text-sm text-white disabled:opacity-50"
          aria-label="Send command"
        >
          →
        </button>
      </form>
      <div className="flex flex-wrap gap-1.5">
        {SHORTCUTS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => submit(s)}
            className="rounded-full border border-[rgba(255,255,255,0.12)] px-2.5 py-1 text-[10px] font-medium text-[rgba(255,255,255,0.7)] transition-colors hover:bg-[rgba(255,255,255,0.08)]"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
