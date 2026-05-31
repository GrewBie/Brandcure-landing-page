"use client";

import { ChatLeadForm } from "@/components/chat/ChatLeadForm";
import { CuratedPicksBar } from "@/components/chat/CuratedPicksBar";
import { VideoSuggestionCard } from "@/components/chat/VideoSuggestionCard";
import { ConversationalOrb } from "@/components/voice/ConversationalOrb";
import { useAgent } from "@/contexts/AgentContext";
import { useChat } from "@/contexts/ChatContext";
import { useNavCatalog } from "@/contexts/NavCatalogContext";
import { usePortfolioExperience } from "@/contexts/PortfolioExperienceContext";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useVoiceNavigator, type VoiceState } from "@/hooks/useVoiceNavigator";
import { usePathname } from "next/navigation";
import { shouldSteerToLeadCapture } from "@/lib/agent-tour";
import { parseAgentResponse, type ChatAction } from "@/lib/chat-actions";
import { inferCommandFromText } from "@/lib/agent-nav-fallback";
import { resolveNavId } from "@/lib/agent-guardrails";
import { applyAgentNavCommand } from "@/lib/portfolio/apply-agent-command";
import { executeVoiceNavCommand } from "@/lib/portfolio/voice-nav-sequence";
import {
  planCuratedPortfolioTour,
  runCuratedPortfolioTour,
} from "@/lib/portfolio/maybe-curate-after-turn";
import { openPortfolioForTour } from "@/lib/portfolio/run-nav-command";
import {
  BRANDCURE_TEL_URI,
  BRANDCURE_WHATSAPP_DISPLAY,
  whatsappUrl,
} from "@/lib/contact";
import { patchFromUserText } from "@/lib/agent-state";
import { sendChatMessage } from "@/lib/navigator-agent";
import {
  CONTACT_CLOSING_SPEECH,
  runContactHandoffSequence,
} from "@/lib/contact-capture";
import { speakWithBrowserTts } from "@/lib/client/browser-tts";
import { cn } from "@/lib/cn";
import {
  micButtonLabel,
  micButtonTitle,
  VOICE_HOW_IT_WORKS,
  voiceHeaderSubtitle,
  voiceStatusMessage,
} from "@/lib/voice/chat-voice-copy";
import {
  hasPlayedNehaIntro,
  markNehaIntroPlayed,
} from "@/lib/portfolio/portfolio-entry";
import { NEHA_DISPLAY_NAME, NEHA_INTRO_SPEECH } from "@/lib/voice/neha-intro";
import { suggestVideo } from "@/lib/video-suggester";
import type { NavItem, NavigatorSection } from "@/types/navigator";
import { Mic, MicOff, Phone, Send } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const SECTIONS: NavigatorSection[] = ["creatives", "automations", "websites"];

function orbStatusShort(state: VoiceState, inCall: boolean): string {
  if (!inCall) return "Tap to talk with Neha";
  if (state === "listening") return "Your turn — speak now";
  if (state === "speaking") return "Neha is speaking";
  if (state === "thinking") return "Neha is thinking";
  return "Voice call active";
}

export function ChatWidget() {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { open, setOpen, badge, setBadge } = useChat();
  const {
    session,
    messages: agentMessages,
    recordTurn,
    patchSession,
  } = useAgent();
  const { catalog, voiceRequestId } = useNavCatalog();
  const { introRequestId, mode: portfolioMode } = usePortfolioExperience();
  const onPortfolio = pathname?.startsWith("/portfolio") ?? false;
  const portfolioMobileVoice =
    onPortfolio && isMobile && portfolioMode !== "manual";
  const [showMobileTextChat, setShowMobileTextChat] = useState(false);

  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [suggestion, setSuggestion] = useState<NavItem | null>(null);
  const [curatedPicks, setCuratedPicks] = useState<NavItem[]>([]);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [whatsappLink, setWhatsappLink] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const seenSuggestions = useRef<string[]>([]);
  const catalogRef = useRef<NavItem[]>(catalog);
  const lastVoiceRequestRef = useRef(voiceRequestId);
  const lastIntroRef = useRef(introRequestId);
  const introRunningRef = useRef(false);

  const closeChatOverlays = useCallback(() => {
    setShowLeadForm(false);
    setBadge(false);
    setOpen(false);
    setShowMobileTextChat(false);
  }, [setOpen, setBadge]);

  const {
    state: voiceState,
    inCall,
    transcript,
    agentSpeech,
    supported: voiceSupported,
    elevenLabsReady,
    startCall,
    endCall,
    speakOutbound,
  } = useVoiceNavigator({
    catalog,
    onSteerToContact: closeChatOverlays,
  });

  const steerToContactForm = useCallback(() => {
    void runContactHandoffSequence(closeChatOverlays).then(async () => {
      if (inCall) endCall();
      else await speakWithBrowserTts(CONTACT_CLOSING_SPEECH);
    });
  }, [closeChatOverlays, inCall, endCall]);

  useEffect(() => {
    catalogRef.current = catalog;
  }, [catalog]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [agentMessages, typing, suggestion, showLeadForm, transcript, agentSpeech, voiceState]);

  const findItem = useCallback((navId?: string): NavItem | null => {
    if (!navId) return null;
    return catalogRef.current.find((i) => i.navId === navId) ?? null;
  }, []);

  const runAction = useCallback(
    (action: ChatAction, conversationText: string) => {
      const navId = action.arg
        ? resolveNavId(action.arg, catalogRef.current)
        : undefined;

      switch (action.type) {
        case "open_portfolio":
          openPortfolioForTour();
          break;
        case "show_website":
        case "open_website":
        case "open_detail":
          if (navId) {
            void executeVoiceNavCommand(catalogRef.current, {
              command:
                action.type === "open_website" ? "show_website" : action.type,
              navId,
              section: catalogRef.current.find((i) => i.navId === navId)
                ?.navSection,
              speech: "",
            });
          }
          break;
        case "scroll_to":
        case "highlight":
        case "play_video":
        case "summarize_card":
          if (navId) {
            void executeVoiceNavCommand(catalogRef.current, {
              command: action.type,
              navId,
              section: catalogRef.current.find((i) => i.navId === navId)
                ?.navSection,
              speech: "",
            });
          } else if (
            action.type === "scroll_to" &&
            action.arg &&
            SECTIONS.includes(action.arg as NavigatorSection)
          ) {
            applyAgentNavCommand(catalogRef.current, {
              command: "scroll_to",
              section: action.arg as NavigatorSection,
              speech: "",
            });
          }
          break;
        case "dismiss_spotlight":
          applyAgentNavCommand(catalogRef.current, {
            command: "dismiss_spotlight",
            speech: "",
          });
          break;
        case "suggest_video": {
          const item =
            findItem(action.arg) ??
            suggestVideo(
              conversationText,
              catalogRef.current,
              seenSuggestions.current,
            );
          if (item) {
            seenSuggestions.current = [...seenSuggestions.current, item.navId];
            setSuggestion(item);
          }
          break;
        }
        case "open_voice":
          if (!portfolioMobileVoice) setOpen(true);
          if (!inCall) startCall();
          break;
        case "open_audit":
        case "capture_lead":
          patchSession({ leadStage: "ready" });
          steerToContactForm();
          break;
        case "prefill_whatsapp": {
          setWhatsappLink(
            whatsappUrl(
              action.arg || "Hi BrandCure, I'd like to know more about your services.",
            ),
          );
          break;
        }
        default:
          break;
      }
    },
    [
      findItem,
      inCall,
      endCall,
      patchSession,
      portfolioMobileVoice,
      setOpen,
      startCall,
      steerToContactForm,
    ],
  );

  const runIntro = useCallback(() => {
    if (introRunningRef.current) return;
    introRunningRef.current = true;
    if (!portfolioMobileVoice) setOpen(true);
    setBadge(false);
    recordTurn("assistant", NEHA_INTRO_SPEECH, "voice");
    patchSession({ leadStage: "exploring" });
    markNehaIntroPlayed();
    void speakOutbound(NEHA_INTRO_SPEECH)
      .then(() => {
        startCall();
      })
      .catch(() => {
        startCall();
      })
      .finally(() => {
        introRunningRef.current = false;
      });
  }, [
    patchSession,
    recordTurn,
    portfolioMobileVoice,
    setBadge,
    setOpen,
    speakOutbound,
    startCall,
  ]);

  const resumeCallWithoutIntro = useCallback(() => {
    if (!portfolioMobileVoice) setOpen(true);
    setBadge(false);
    if (!inCall) startCall();
  }, [inCall, portfolioMobileVoice, setBadge, setOpen, startCall]);

  useEffect(() => {
    if (introRequestId === 0 || introRequestId === lastIntroRef.current) return;
    lastIntroRef.current = introRequestId;
    if (hasPlayedNehaIntro()) {
      resumeCallWithoutIntro();
      return;
    }
    runIntro();
  }, [introRequestId, runIntro, resumeCallWithoutIntro]);

  useEffect(() => {
    if (voiceRequestId === lastVoiceRequestRef.current) return;
    lastVoiceRequestRef.current = voiceRequestId;
    setOpen(true);
    setBadge(false);
    if (!inCall) startCall();
  }, [voiceRequestId, inCall, setOpen, setBadge, startCall]);

  const sendText = async () => {
    const text = input.trim();
    if (!text || typing) return;

    if (inCall) endCall();

    recordTurn("user", text, "chat");
    const userPatch = patchFromUserText(text);
    patchSession(userPatch);
    setInput("");
    setTyping(true);

    const nextMessages = [
      ...agentMessages,
      {
        role: "user" as const,
        content: text,
        channel: "chat" as const,
        at: new Date().toISOString(),
      },
    ];
    const baseSession = { ...session, ...userPatch };

    try {
      const data = await sendChatMessage(
        nextMessages,
        baseSession,
        catalogRef.current,
      );

      const raw =
        data.content ??
        "Thanks for reaching out — our team will follow up shortly.";
      const { clean, actions } = parseAgentResponse(raw);

      if (data.stateUpdate && Object.keys(data.stateUpdate).length > 0) {
        patchSession(data.stateUpdate);
      }

      const merged = { ...baseSession, ...data.stateUpdate };
      const contactHandoff = actions.some(
        (a) => a.type === "capture_lead" || a.type === "open_audit",
      );

      if (contactHandoff) {
        patchSession({ leadStage: "ready" });
        recordTurn("assistant", CONTACT_CLOSING_SPEECH, "chat");
        steerToContactForm();
        setTyping(false);
        return;
      }

      if (shouldSteerToLeadCapture(merged)) {
        patchSession({ leadStage: "ready" });
      }

      recordTurn("assistant", clean || "Got it!", "chat");

      const fullMessages = [
        ...nextMessages,
        {
          role: "assistant" as const,
          content: clean || "Got it!",
          channel: "chat" as const,
          at: new Date().toISOString(),
        },
      ];

      const plan = planCuratedPortfolioTour(
        catalogRef.current,
        merged,
        fullMessages,
      );

      const aiShowedPortfolio = actions.some((a) =>
        ["highlight", "play_video", "summarize_card"].includes(a.type),
      );

      if (plan) {
        patchSession(plan.sessionPatch);
        setCuratedPicks(plan.picks);
        if (!aiShowedPortfolio) {
          requestAnimationFrame(() => {
            runCuratedPortfolioTour(catalogRef.current, plan.picks);
          });
        }
      }

      const conversationText = [
        ...agentMessages.map((m) => m.content),
        text,
        raw,
      ].join(" ");
      requestAnimationFrame(() => {
        actions.forEach((a) => runAction(a, conversationText));
      });
    } catch {
      const fallback = inferCommandFromText(
        text,
        catalogRef.current,
        baseSession,
      );
      recordTurn("assistant", fallback.speech, "chat");
      applyAgentNavCommand(catalogRef.current, fallback);
      if (
        fallback.command === "open_audit" ||
        fallback.command === "capture_lead"
      ) {
        patchSession({ leadStage: "ready" });
        recordTurn("assistant", CONTACT_CLOSING_SPEECH, "chat");
        steerToContactForm();
        setTyping(false);
        return;
      }
      if (fallback.stateUpdate) patchSession(fallback.stateUpdate);

      const fullMessages = [
        ...nextMessages,
        {
          role: "assistant" as const,
          content: fallback.speech,
          channel: "chat" as const,
          at: new Date().toISOString(),
        },
      ];
      const plan = planCuratedPortfolioTour(
        catalogRef.current,
        { ...baseSession, ...fallback.stateUpdate },
        fullMessages,
      );
      if (plan) {
        patchSession(plan.sessionPatch);
        setCuratedPicks(plan.picks);
        requestAnimationFrame(() => {
          runCuratedPortfolioTour(catalogRef.current, plan.picks);
        });
      }
    }
    setTyping(false);
  };

  const toggleVoiceCall = () => {
    setBadge(false);
    if (!portfolioMobileVoice) setOpen(true);
    if (inCall) endCall();
    else startCall();
  };

  const closeChat = () => {
    if (inCall) endCall();
    setOpen(false);
    setShowMobileTextChat(false);
  };

  const showFullChatPanel = portfolioMobileVoice
    ? open || showMobileTextChat
    : open;

  const liveVoiceLine =
    inCall && voiceState === "listening"
      ? transcript
      : inCall && (voiceState === "speaking" || voiceState === "thinking")
        ? agentSpeech
        : "";

  return (
    <>
      {portfolioMobileVoice && !showFullChatPanel && (
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            setShowMobileTextChat(true);
            setBadge(false);
          }}
          className="fixed bottom-24 right-4 z-[500] cursor-pointer rounded-full border border-[var(--border)] bg-warm-white/95 px-3 py-2 text-[11px] font-semibold text-charcoal shadow-md md:hidden"
        >
          Open chat
        </button>
      )}

      {portfolioMobileVoice && (
        <div
          className="fixed bottom-5 left-4 z-[502] flex flex-col items-center gap-2 md:hidden"
          aria-label="Neha voice assistant"
        >
          <p
            className="m-0 max-w-[min(200px,55vw)] rounded-full bg-charcoal/90 px-3 py-1.5 text-center text-[10px] font-medium leading-snug text-white shadow-lg backdrop-blur-sm"
            role="status"
            aria-live="polite"
          >
            {orbStatusShort(voiceState, inCall)}
          </p>
          <ConversationalOrb
            state={voiceState}
            inCall={inCall}
            onClick={toggleVoiceCall}
            size="lg"
          />
          <button
            type="button"
            onClick={() => {
              setShowMobileTextChat((v) => {
                const next = !v;
                setOpen(next);
                return next;
              });
            }}
            className="cursor-pointer rounded-full border border-[var(--border)] bg-warm-white/95 px-3 py-1 text-[10px] font-semibold text-charcoal shadow-sm"
          >
            {showMobileTextChat ? "Hide text" : "Type instead"}
          </button>
        </div>
      )}

      <div
        className={cn(
          "fixed bottom-6 right-6 z-[500] md:bottom-8 md:right-8",
          portfolioMobileVoice && "pointer-events-none md:pointer-events-auto",
        )}
      >
      {showFullChatPanel && (
        <div
          className={cn(
            "animate-slide-up pointer-events-auto mb-3 flex flex-col overflow-hidden rounded-[18px] border border-[var(--border)] bg-warm-white shadow-[0_32px_90px_rgba(0,0,0,0.22)]",
            portfolioMobileVoice
              ? "fixed bottom-28 left-4 right-4 z-[501] max-h-[min(52vh,420px)] w-auto"
              : "h-[min(580px,calc(100vh-120px))] w-[min(392px,calc(100vw-48px))]",
          )}
          role="dialog"
          aria-label="Neha — BrandCure AI advisor"
        >
          <header className="border-b border-[rgba(255,255,255,0.08)] bg-charcoal px-4 py-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold font-serif text-lg italic text-white">
                  N
                </div>
                <div>
                  <p className="m-0 text-[13px] font-semibold text-white">
                    {NEHA_DISPLAY_NAME}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        inCall ? "bg-success animate-green-pulse" : "bg-gold",
                      )}
                    />
                    <p className="m-0 max-w-[220px] text-[10px] leading-snug tracking-[0.02em] text-[rgba(255,255,255,0.55)]">
                      {voiceHeaderSubtitle(inCall)}
                    </p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={closeChat}
                className="cursor-pointer rounded-lg border-none bg-[rgba(255,255,255,0.08)] px-2 py-1 text-lg leading-none text-[rgba(255,255,255,0.55)] hover:text-white"
                aria-label="Close chat"
              >
                ×
              </button>
            </div>

            <div className="mt-2.5 flex flex-wrap gap-2">
              <a
                href={whatsappUrl("Hi BrandCure, I'd like to chat.")}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-success/20 px-2.5 py-1 text-[10px] font-semibold text-success hover:bg-success/30"
              >
                WhatsApp {BRANDCURE_WHATSAPP_DISPLAY}
              </a>
              <a
                href={`tel:${BRANDCURE_TEL_URI}`}
                className="inline-flex items-center gap-1 rounded-full bg-[rgba(255,255,255,0.08)] px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-[rgba(255,255,255,0.14)]"
              >
                <Phone className="h-3 w-3" aria-hidden />
                Call us
              </a>
            </div>
          </header>

          {inCall ? (
            <div
              className="border-b border-gold/25 bg-gold/12 px-4 py-2.5"
              role="status"
              aria-live="polite"
            >
              <p className="m-0 text-center text-[11px] font-semibold leading-snug text-charcoal">
                {voiceState === "listening"
                  ? "● On call — your turn to speak"
                  : voiceState === "speaking"
                    ? "● On call — Neha is speaking"
                    : voiceState === "thinking"
                      ? "● On call — Neha is thinking"
                      : voiceState === "denied"
                        ? "● Microphone blocked"
                        : "● Voice call active"}
              </p>
              <p className="m-0 mt-1 text-center text-[10px] leading-relaxed text-gray">
                {voiceStatusMessage(voiceState, inCall, elevenLabsReady)}
              </p>
            </div>
          ) : (
            voiceSupported && (
              <details className="group border-b border-[var(--border)] bg-cream/80">
                <summary className="cursor-pointer list-none px-4 py-2.5 text-[11px] font-semibold text-charcoal marker:content-none [&::-webkit-details-marker]:hidden">
                  <span className="inline-flex items-center gap-2">
                    <Mic className="h-3.5 w-3.5 text-gold" aria-hidden />
                    How voice works
                    <span className="text-[10px] font-normal text-gray group-open:hidden">
                      (tap to expand)
                    </span>
                  </span>
                </summary>
                <ol className="m-0 list-decimal space-y-1.5 border-t border-[var(--border)] bg-warm-white px-4 py-3 pl-8 text-[10px] leading-relaxed text-gray">
                  {VOICE_HOW_IT_WORKS.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </details>
            )
          )}

          <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto p-4">
            {agentMessages.map((msg, i) => (
              <div
                key={`${msg.at}-${i}`}
                className={cn(
                  "flex",
                  msg.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[88%] whitespace-pre-wrap px-3.5 py-2.5 text-[13px] leading-[1.65]",
                    msg.role === "user"
                      ? "rounded-[14px_14px_3px_14px] bg-charcoal text-white"
                      : "rounded-[14px_14px_14px_3px] bg-cream text-charcoal",
                  )}
                >
                  {msg.content}
                  {msg.channel === "voice" && (
                    <span className="mt-1 block text-[9px] uppercase tracking-[0.08em] opacity-55">
                      🎤 voice call
                    </span>
                  )}
                </div>
              </div>
            ))}

            {liveVoiceLine &&
              !agentMessages.some((m) => m.content === liveVoiceLine) && (
                <div
                  className={cn(
                    "flex",
                    voiceState === "listening" ? "justify-end" : "justify-start",
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[88%] px-3.5 py-2.5 text-[13px] leading-[1.65] italic",
                      voiceState === "listening"
                        ? "rounded-[14px_14px_3px_14px] bg-charcoal/75 text-white"
                        : "rounded-[14px_14px_14px_3px] bg-gold/25 text-charcoal",
                    )}
                  >
                    {liveVoiceLine}
                  </div>
                </div>
              )}

            {whatsappLink && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setWhatsappLink(null)}
                className="w-fit rounded-full bg-success px-4 py-2.5 text-[12px] font-semibold text-white hover:opacity-90"
              >
                Open WhatsApp chat →
              </a>
            )}

            {showLeadForm && (
              <ChatLeadForm
                onDone={() => {
                  patchSession({ leadStage: "captured" });
                  setShowLeadForm(false);
                }}
              />
            )}

            {typing && (
              <div className="flex w-fit gap-1 rounded-[14px_14px_14px_3px] bg-cream px-4 py-3">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="block h-1.5 w-1.5 rounded-full bg-gray"
                    style={{
                      animation: `blink 1.3s ${i * 0.22}s infinite`,
                    }}
                  />
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>

          {curatedPicks.length > 0 && (
            <CuratedPicksBar
              items={curatedPicks}
              catalog={catalog}
              onDismiss={() => setCuratedPicks([])}
            />
          )}

          {suggestion && (
            <div className="border-t border-[var(--border)] p-3">
              <VideoSuggestionCard
                item={suggestion}
                onDismiss={() => setSuggestion(null)}
              />
            </div>
          )}

          <div className="border-t border-[var(--border)] bg-cream/50 p-3">
            {!inCall && voiceSupported && (
              <p className="mb-2 text-center text-[10px] leading-snug text-gray">
                <span className="font-semibold text-charcoal">Want to talk?</span>{" "}
                Tap <span className="font-semibold text-gold">Talk</span> — gold
                mic starts a voice call. Type below anytime instead.
              </p>
            )}
            <form
              className="flex items-end gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void sendText();
              }}
            >
              <button
                type="button"
                onClick={toggleVoiceCall}
                disabled={!voiceSupported}
                title={micButtonTitle(inCall, voiceSupported)}
                className={cn(
                  "flex min-h-[44px] shrink-0 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-[10px] border-none px-2.5 transition-colors",
                  inCall
                    ? "bg-error text-white hover:bg-error/90"
                    : "bg-gold text-brand-black hover:bg-gold/90",
                  !voiceSupported && "cursor-not-allowed opacity-40",
                )}
                aria-label={micButtonTitle(inCall, voiceSupported)}
              >
                {inCall ? (
                  <MicOff className="h-5 w-5" aria-hidden />
                ) : (
                  <Mic className="h-5 w-5" aria-hidden />
                )}
                <span className="text-[9px] font-bold leading-none tracking-wide">
                  {micButtonLabel(inCall)}
                </span>
              </button>
              <label htmlFor="chat-input" className="sr-only">
                Message Neha
              </label>
              <input
                id="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  inCall
                    ? "On a voice call — type here if you prefer…"
                    : "Type a message, or tap Talk to speak…"
                }
                disabled={typing}
                className="min-h-[44px] flex-1 rounded-[10px] border border-[var(--border)] bg-warm-white px-3.5 text-[13px] text-charcoal focus:border-gold focus:outline-none"
              />
              <button
                type="submit"
                disabled={typing || !input.trim()}
                className="flex h-11 min-w-[44px] cursor-pointer items-center justify-center gap-1 rounded-[10px] border-none bg-charcoal px-3 text-white transition-colors hover:bg-brand-black disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" aria-hidden />
              </button>
            </form>
            {!voiceSupported && (
              <p className="mt-2 text-center text-[10px] leading-relaxed text-gray">
                Voice calls need Chrome or Edge on desktop/Android. Please use
                the message box above — Neha works fully by text.
              </p>
            )}
          </div>
        </div>
      )}

      {!portfolioMobileVoice && (
      <div className="pointer-events-auto relative ml-auto w-14">
        {badge && !open && (
          <span className="animate-pop-in absolute -top-1 -right-1 z-[1] flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 border-cream bg-gold text-[9px] font-bold text-white">
            1
          </span>
        )}
        <button
          type="button"
          onClick={() => {
            if (open) closeChat();
            else {
              setOpen(true);
              setBadge(false);
            }
          }}
          className={cn(
            "flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border-none font-serif text-xl text-white shadow-[0_8px_32px_rgba(0,0,0,0.24)] transition-all duration-[220ms] hover:scale-110 hover:bg-brand-black",
            open ? "bg-charcoal" : "bg-charcoal hover:rotate-[8deg]",
            inCall && !open && "ring-2 ring-gold ring-offset-2 ring-offset-cream",
          )}
          title={
            open
              ? "Close chat"
              : "Chat with Neha — voice call or text"
          }
          aria-label={
            open
              ? "Close chat with Neha"
              : "Open chat with Neha — voice or text"
          }
        >
          {open ? "×" : "✦"}
        </button>
        {!open && (
          <span className="pointer-events-none absolute -top-9 right-0 hidden whitespace-nowrap rounded-md bg-charcoal px-2 py-1 text-[10px] font-medium text-white shadow-md md:block">
            Chat · voice or type
          </span>
        )}
      </div>
      )}
      </div>
    </>
  );
}
