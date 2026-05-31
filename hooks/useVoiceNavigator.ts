"use client";

import { useAgent } from "@/contexts/AgentContext";
import { inferCommandFromText } from "@/lib/agent-nav-fallback";
import { browserNav } from "@/lib/browser-navigator";
import { patchFromUserText } from "@/lib/agent-state";
import { playElevenLabsTts } from "@/lib/client/elevenlabs-audio";
import { speakWithBrowserTts } from "@/lib/client/browser-tts";
import { applyAgentNavCommand } from "@/lib/portfolio/apply-agent-command";
import {
  planCuratedPortfolioTour,
  runCuratedPortfolioTour,
} from "@/lib/portfolio/maybe-curate-after-turn";
import { focusPortfolioItem } from "@/lib/portfolio/run-nav-command";
import { shouldSteerToLeadCapture } from "@/lib/agent-tour";
import { classifyAndCommand } from "@/lib/navigator-agent";
import type {
  NavItem,
  NavigatorCommand,
  NavigatorSection,
} from "@/types/navigator";
import { useCallback, useEffect, useRef, useState } from "react";

export type VoiceState =
  | "idle"
  | "listening"
  | "thinking"
  | "speaking"
  | "denied"
  | "unsupported";

/** Pause after last word before we send the turn to the AI (call mode). */
const END_OF_TURN_MS = 1400;

export type UseVoiceNavigatorOptions = {
  catalog: NavItem[];
  onCaptureLead?: () => void;
  onOpenAudit?: () => void;
};

export const NAV_EVENTS = {
  filterIndustry: "nav:filter-industry",
  showAll: "nav:show-all",
} as const;

function getRecognitionCtor() {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

export function useVoiceNavigator({
  catalog,
  onCaptureLead,
  onOpenAudit,
}: UseVoiceNavigatorOptions) {
  const {
    messages,
    session,
    recordTurn,
    patchSession,
    applyNavigatorCommand,
    syncNavPosition,
  } = useAgent();

  const [state, setState] = useState<VoiceState>("idle");
  const [inCall, setInCall] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [agentSpeech, setAgentSpeech] = useState("");

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ttsAbortRef = useRef<AbortController | null>(null);
  const listeningPausedRef = useRef(false);
  /** Bumps when we intentionally stop recognition — ignores stale onend handlers. */
  const micGenerationRef = useRef(0);
  const ensureMicActiveRef = useRef<() => void>(() => {});
  const [elevenLabsReady, setElevenLabsReady] = useState(true);
  const inCallRef = useRef(false);
  const processingRef = useRef(false);
  const curatedTourRef = useRef<NavItem[] | null>(null);
  const utteranceBufferRef = useRef("");
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sectionRef = useRef<NavigatorSection | null>(
    session.currentSection ?? null,
  );
  const indexRef = useRef(session.currentItemIndex);
  const stateRef = useRef<VoiceState>("idle");
  const catalogRef = useRef<NavItem[]>(catalog);
  const messagesRef = useRef(messages);
  const sessionRef = useRef(session);

  useEffect(() => {
    catalogRef.current = catalog;
  }, [catalog]);

  useEffect(() => {
    messagesRef.current = messages;
    sessionRef.current = session;
    sectionRef.current = session.currentSection ?? sectionRef.current;
    indexRef.current = session.currentItemIndex;
  }, [messages, session]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/tts")
      .then((res) => res.json())
      .then((data: { configured?: boolean }) => {
        if (!cancelled) setElevenLabsReady(Boolean(data.configured));
      })
      .catch(() => {
        if (!cancelled) setElevenLabsReady(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setVoiceState = useCallback((next: VoiceState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const clearRestartTimer = useCallback(() => {
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
  }, []);

  const detachRecognition = useCallback(() => {
    micGenerationRef.current += 1;
    const rec = recognitionRef.current;
    recognitionRef.current = null;
    if (!rec) return;
    rec.onend = null;
    rec.onerror = null;
    rec.onresult = null;
    rec.onstart = null;
    try {
      rec.stop();
    } catch {
      try {
        rec.abort();
      } catch {
        /* ignore */
      }
    }
  }, []);

  /** Stops mic during AI think/speak without tearing down the call. */
  const pauseListening = useCallback(() => {
    listeningPausedRef.current = true;
    clearSilenceTimer();
    detachRecognition();
  }, [clearSilenceTimer, detachRecognition]);

  const scheduleMicRestart = useCallback(
    (delayMs = 300) => {
      if (!inCallRef.current) return;
      clearRestartTimer();
      restartTimerRef.current = setTimeout(() => {
        ensureMicActiveRef.current();
      }, delayMs);
    },
    [clearRestartTimer],
  );

  const abortTts = useCallback(() => {
    ttsAbortRef.current?.abort();
    ttsAbortRef.current = null;
  }, []);

  const stopAudio = useCallback(() => {
    abortTts();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
  }, [abortTts]);

  const processUtteranceRef = useRef<(text: string) => Promise<void>>(
    async () => {},
  );
  const scheduleEndOfTurnRef = useRef<() => void>(() => {});

  const resumeCallAfterTts = useCallback(() => {
    if (!inCallRef.current) {
      setVoiceState("idle");
      return;
    }
    if (processingRef.current || listeningPausedRef.current) return;
    setVoiceState("listening");
    scheduleMicRestart(320);
  }, [scheduleMicRestart, setVoiceState]);

  const playElevenLabsSpeech = useCallback(
    async (text: string, opts?: { signal?: AbortSignal }) => {
      setAgentSpeech(text);
      const controller = new AbortController();
      ttsAbortRef.current = controller;
      const signal = opts?.signal;
      const linked = signal
        ? (() => {
            if (signal.aborted) controller.abort();
            else
              signal.addEventListener("abort", () => controller.abort(), {
                once: true,
              });
            return controller.signal;
          })()
        : controller.signal;

      setVoiceState("speaking");

      const onAudioElement = (audio: HTMLAudioElement) => {
        audioRef.current = audio;
      };

      let result = await playElevenLabsTts(text, {
        signal: linked,
        onAudioElement,
      });

      if (result === "failed" && !linked.aborted) {
        await new Promise((resolve) => setTimeout(resolve, 350));
        result = await playElevenLabsTts(text, {
          signal: linked,
          onAudioElement,
        });
      }

      if (result === "not_configured") {
        setElevenLabsReady(false);
      }

      if (
        (result === "failed" || result === "not_configured") &&
        !linked.aborted
      ) {
        await speakWithBrowserTts(text);
        return "played";
      }

      if (ttsAbortRef.current === controller) {
        ttsAbortRef.current = null;
      }

      return result;
    },
    [setVoiceState],
  );

  const speak = useCallback(
    async (text: string) => {
      listeningPausedRef.current = true;
      pauseListening();
      stopAudio();
      try {
        await playElevenLabsSpeech(text);
        await new Promise((resolve) => setTimeout(resolve, 600));
      } finally {
        listeningPausedRef.current = false;
      }
    },
    [pauseListening, playElevenLabsSpeech, stopAudio],
  );

  const speakOutbound = useCallback(
    async (text: string) => {
      listeningPausedRef.current = true;
      pauseListening();
      stopAudio();
      try {
        await playElevenLabsSpeech(text);
        await new Promise((resolve) => setTimeout(resolve, 600));
      } finally {
        listeningPausedRef.current = false;
        if (inCallRef.current) resumeCallAfterTts();
        else setVoiceState("idle");
      }
    },
    [
      pauseListening,
      playElevenLabsSpeech,
      resumeCallAfterTts,
      setVoiceState,
      stopAudio,
    ],
  );

  const focusNavItem = useCallback((navId: string, playVideo = false) => {
    const item = catalogRef.current.find((i) => i.navId === navId);
    if (item) {
      sectionRef.current = item.navSection;
      indexRef.current = browserNav.getItemIndex(navId);
    }
    focusPortfolioItem(catalogRef.current, navId, playVideo);
  }, []);

  const executeCommand = useCallback(
    (command: NavigatorCommand) => {
      switch (command.command) {
        case "next_item": {
          const section =
            sectionRef.current ?? browserNav.getCurrentScrollSection();
          if (section) {
            const navId = browserNav.nextItem(section, indexRef.current);
            sectionRef.current = section;
            if (navId) focusNavItem(navId, true);
          }
          break;
        }
        case "prev_item": {
          const section =
            sectionRef.current ?? browserNav.getCurrentScrollSection();
          if (section) {
            const navId = browserNav.prevItem(section, indexRef.current);
            sectionRef.current = section;
            if (navId) focusNavItem(navId, true);
          }
          break;
        }
        case "show_all":
          if (command.section) {
            window.dispatchEvent(
              new CustomEvent(NAV_EVENTS.showAll, {
                detail: { section: command.section },
              }),
            );
            browserNav.scrollToSection(command.section);
          }
          break;
        case "filter_industry":
          if (command.industry) {
            window.dispatchEvent(
              new CustomEvent(NAV_EVENTS.filterIndustry, {
                detail: { industry: command.industry },
              }),
            );
            browserNav.scrollToSection("websites");
          }
          break;
        case "capture_lead":
          onCaptureLead?.();
          break;
        case "open_audit":
          onOpenAudit?.();
          break;
        default:
          applyAgentNavCommand(catalogRef.current, command);
          if (command.section) sectionRef.current = command.section;
          if (command.navId) {
            indexRef.current = browserNav.getItemIndex(command.navId);
          }
          break;
      }
    },
    [focusNavItem, onCaptureLead, onOpenAudit],
  );

  const processUtterance = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || processingRef.current) {
        if (inCallRef.current && !processingRef.current) {
          setVoiceState("listening");
        }
        return;
      }

      processingRef.current = true;
      pauseListening();
      utteranceBufferRef.current = "";
      setTranscript("");
      setVoiceState("thinking");

      const userPatch = patchFromUserText(trimmed);
      patchSession(userPatch);
      recordTurn("user", trimmed, "voice");

      const userEntry = {
        role: "user" as const,
        content: trimmed,
        channel: "voice" as const,
        at: new Date().toISOString(),
      };
      const nextMessages = [...messagesRef.current, userEntry];
      const baseSession = { ...sessionRef.current, ...userPatch };

      let command: NavigatorCommand;
      try {
        command = await classifyAndCommand(
          nextMessages,
          sessionRef.current,
          catalogRef.current,
        );
      } catch {
        command = inferCommandFromText(
          trimmed,
          catalogRef.current,
          sessionRef.current,
        );
      }

      const catalogItem = command.navId
        ? catalogRef.current.find((i) => i.navId === command.navId)
        : undefined;

      if (command.stateUpdate) patchSession(command.stateUpdate);

      const mergedSession = {
        ...baseSession,
        ...command.stateUpdate,
      };

      const plan = planCuratedPortfolioTour(
        catalogRef.current,
        mergedSession,
        nextMessages,
      );

      const visualPortfolio = new Set([
        "highlight",
        "play_video",
        "summarize_card",
      ]);
      const aiShowedCard =
        Boolean(command.navId) && visualPortfolio.has(command.command);

      curatedTourRef.current = null;
      if (plan) {
        patchSession(plan.sessionPatch);
        if (!aiShowedCard) {
          curatedTourRef.current = plan.picks;
          if (
            command.command === "speak_only" &&
            !command.speech.toLowerCase().includes("show")
          ) {
            const names = plan.picks.map((p) => p.title).join(", ");
            command.speech = `Based on what you shared, I'll walk you through ${plan.picks.length} projects that fit — ${names}.`;
          }
        }
      }

      applyNavigatorCommand(command, catalogItem?.title);
      executeCommand(command);
      syncNavPosition(sectionRef.current ?? undefined, indexRef.current);

      if (
        shouldSteerToLeadCapture(mergedSession) &&
        command.command !== "capture_lead" &&
        command.command !== "open_audit"
      ) {
        patchSession({ leadStage: "ready" });
      }

      recordTurn("assistant", command.speech, "voice");
      try {
        await speak(command.speech);
      } catch (err) {
        console.error("[voice] speak failed:", err);
        await speakWithBrowserTts(command.speech);
      } finally {
        const curated = curatedTourRef.current;
        curatedTourRef.current = null;
        if (curated?.length) {
          runCuratedPortfolioTour(catalogRef.current, curated);
        }
        processingRef.current = false;
        listeningPausedRef.current = false;
        resumeCallAfterTts();
      }
    },
    [
      speak,
      executeCommand,
      setVoiceState,
      patchSession,
      recordTurn,
      applyNavigatorCommand,
      syncNavPosition,
      pauseListening,
      resumeCallAfterTts,
    ],
  );

  processUtteranceRef.current = processUtterance;

  const scheduleEndOfTurn = useCallback(() => {
    clearSilenceTimer();
    silenceTimerRef.current = setTimeout(() => {
      const text = utteranceBufferRef.current.trim();
      if (text && inCallRef.current && !processingRef.current) {
        utteranceBufferRef.current = "";
        void processUtteranceRef.current(text);
      }
    }, END_OF_TURN_MS);
  }, [clearSilenceTimer]);

  scheduleEndOfTurnRef.current = scheduleEndOfTurn;

  ensureMicActiveRef.current = () => {
    if (!inCallRef.current) return;
    if (listeningPausedRef.current || processingRef.current) return;
    if (recognitionRef.current) return;

    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      setVoiceState("unsupported");
      inCallRef.current = false;
      setInCall(false);
      return;
    }

    const generation = micGenerationRef.current + 1;
    micGenerationRef.current = generation;

    const recognition = new Ctor();
    recognition.lang = "en-IN";
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      if (generation !== micGenerationRef.current) return;
      setVoiceState("listening");
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      if (generation !== micGenerationRef.current) return;
      if (listeningPausedRef.current || processingRef.current) return;

      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const chunk = result[0]?.transcript ?? "";
        if (result.isFinal) {
          utteranceBufferRef.current += `${chunk} `;
          scheduleEndOfTurnRef.current();
        } else {
          interim += chunk;
        }
      }
      setTranscript((utteranceBufferRef.current + interim).trim());
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (generation !== micGenerationRef.current) return;

      if (
        event.error === "not-allowed" ||
        event.error === "service-not-allowed"
      ) {
        inCallRef.current = false;
        setInCall(false);
        setVoiceState("denied");
        return;
      }

      if (event.error === "aborted") return;

      if (inCallRef.current && !listeningPausedRef.current) {
        scheduleMicRestart(event.error === "no-speech" ? 120 : 350);
      }
    };

    recognition.onend = () => {
      if (generation !== micGenerationRef.current) return;
      recognitionRef.current = null;

      if (
        inCallRef.current &&
        !processingRef.current &&
        !listeningPausedRef.current
      ) {
        scheduleMicRestart(200);
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      if (inCallRef.current && !listeningPausedRef.current) {
        scheduleMicRestart(500);
      }
    }
  };

  const startCall = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      setVoiceState("unsupported");
      return;
    }
    stopAudio();
    inCallRef.current = true;
    setInCall(true);
    listeningPausedRef.current = false;
    utteranceBufferRef.current = "";
    setTranscript("");
    ensureMicActiveRef.current();
  }, [stopAudio, setVoiceState]);

  const endCall = useCallback(() => {
    inCallRef.current = false;
    setInCall(false);
    listeningPausedRef.current = false;
    processingRef.current = false;
    micGenerationRef.current += 1;
    clearSilenceTimer();
    clearRestartTimer();
    detachRecognition();
    stopAudio();
    utteranceBufferRef.current = "";
    setTranscript("");
    setAgentSpeech("");
    setVoiceState("idle");
  }, [
    clearRestartTimer,
    clearSilenceTimer,
    detachRecognition,
    stopAudio,
    setVoiceState,
  ]);

  /** Keeps the mic alive for the whole call (Chrome often stops continuous STT). */
  useEffect(() => {
    if (!inCall) return;

    const watchdog = setInterval(() => {
      if (
        inCallRef.current &&
        !processingRef.current &&
        !listeningPausedRef.current &&
        !recognitionRef.current
      ) {
        ensureMicActiveRef.current();
      }
    }, 1800);

    return () => clearInterval(watchdog);
  }, [inCall]);

  const submitText = useCallback(
    (text: string) => {
      if (!inCallRef.current) {
        inCallRef.current = true;
        setInCall(true);
      }
      setTranscript(text);
      void processUtteranceRef.current(text);
    },
    [],
  );

  useEffect(() => {
    return () => {
      inCallRef.current = false;
      clearSilenceTimer();
      clearRestartTimer();
      micGenerationRef.current += 1;
      detachRecognition();
      abortTts();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [abortTts, clearRestartTimer, clearSilenceTimer, detachRecognition]);

  const supported = getRecognitionCtor() !== null;

  return {
    state,
    inCall,
    transcript,
    agentSpeech,
    supported,
    elevenLabsReady,
    startCall,
    endCall,
    speakOutbound,
    submitText,
  };
}
