"use client";

import { useState } from "react";

type Status = "idle" | "submitting" | "done" | "error";

export function ChatLeadForm({ onDone }: { onDone?: () => void }) {
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "submitting") return;
    if (name.trim().length < 2 || whatsapp.trim().length < 6) {
      setStatus("error");
      return;
    }
    setStatus("submitting");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "chat",
          name: name.trim(),
          whatsapp: whatsapp.trim(),
        }),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("done");
      onDone?.();
    } catch {
      setStatus("error");
    }
  };

  if (status === "done") {
    return (
      <div className="rounded-[12px] border border-success/40 bg-[rgba(76,175,80,0.08)] p-3 text-[12px] text-charcoal">
        Got it — our team will message you on WhatsApp shortly. 🎉
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-2 rounded-[12px] border border-[var(--border)] bg-cream p-3"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-gray">
        Quick intro — we&apos;ll WhatsApp you
      </p>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        className="min-h-[40px] rounded-[8px] border border-[var(--border)] bg-warm-white px-3 text-[13px] text-charcoal focus:border-gold focus:outline-none"
      />
      <input
        value={whatsapp}
        onChange={(e) => setWhatsapp(e.target.value)}
        placeholder="+91 8838924425"
        inputMode="tel"
        className="min-h-[40px] rounded-[8px] border border-[var(--border)] bg-warm-white px-3 text-[13px] text-charcoal focus:border-gold focus:outline-none"
      />
      {status === "error" && (
        <p className="text-[11px] text-error">
          Please enter your name and a valid WhatsApp number.
        </p>
      )}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="min-h-[40px] cursor-pointer rounded-[8px] border-none bg-charcoal px-3 text-[13px] font-semibold text-white hover:bg-brand-black disabled:opacity-50"
      >
        {status === "submitting" ? "Sending…" : "Send to our team"}
      </button>
    </form>
  );
}
