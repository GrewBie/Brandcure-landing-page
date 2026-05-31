"use client";

import { VoiceAgentPanel } from "@/components/voice/VoiceAgentPanel";
import { useAgent } from "@/contexts/AgentContext";
import { useChat } from "@/contexts/ChatContext";
import { useNavCatalog } from "@/contexts/NavCatalogContext";
import { usePortfolioExperience } from "@/contexts/PortfolioExperienceContext";
import { useVoiceNavigator } from "@/hooks/useVoiceNavigator";
import { NEHA_INTRO_SPEECH } from "@/lib/voice/neha-intro";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export function VoiceOrb() {
  const pathname = usePathname();
  const { catalog, voiceRequestId } = useNavCatalog();
  const { mode, introRequestId } = usePortfolioExperience();
  const { setOpen } = useChat();
  const { messages, session, recordTurn, patchSession } = useAgent();
  const [panelOpen, setPanelOpen] = useState(false);

  const onPortfolio = pathname?.startsWith("/portfolio") ?? false;
  const manualBrowse = onPortfolio && mode === "manual";

  const closeVoiceOverlays = useCallback(() => {
    setPanelOpen(false);
    setOpen(false);
  }, [setOpen]);

  const {
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
  } = useVoiceNavigator({
    catalog,
    onSteerToContact: closeVoiceOverlays,
  });

  const lastRequestRef = useRef(voiceRequestId);
  const lastIntroRef = useRef(introRequestId);
  const introRunningRef = useRef(false);
  const userCollapsedRef = useRef(false);

  useEffect(() => {
    if (manualBrowse) return;
    if (introRequestId === 0 || introRequestId === lastIntroRef.current) return;
    if (catalog.length === 0) return;
    if (introRunningRef.current) return;

    lastIntroRef.current = introRequestId;
    introRunningRef.current = true;
    userCollapsedRef.current = false;
    setPanelOpen(true);
    recordTurn("assistant", NEHA_INTRO_SPEECH, "voice");
    patchSession({ leadStage: "exploring" });

    void speakOutbound(NEHA_INTRO_SPEECH).then(() => {
      startCall();
      introRunningRef.current = false;
    });
  }, [
    introRequestId,
    catalog.length,
    manualBrowse,
    recordTurn,
    patchSession,
    speakOutbound,
    startCall,
  ]);

  useEffect(() => {
    if (manualBrowse) return;
    if (voiceRequestId !== lastRequestRef.current) {
      lastRequestRef.current = voiceRequestId;
      userCollapsedRef.current = false;
      setPanelOpen(true);
      if (!inCall) startCall();
    }
  }, [voiceRequestId, startCall, inCall, manualBrowse]);

  useEffect(() => {
    if (userCollapsedRef.current) return;
    if (inCall || state !== "idle") setPanelOpen(true);
  }, [inCall, state]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (manualBrowse) return;
      if (e.code !== "Space") return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName.toLowerCase();
      if (tag === "input" || tag === "textarea" || target?.isContentEditable) {
        return;
      }
      e.preventDefault();
      userCollapsedRef.current = false;
      setPanelOpen(true);
      if (inCall) endCall();
      else startCall();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [inCall, startCall, endCall, manualBrowse]);

  const handleOrbClick = () => {
    userCollapsedRef.current = false;
    setPanelOpen(true);
    if (inCall) endCall();
    else startCall();
  };

  const handleClose = () => {
    userCollapsedRef.current = true;
    setPanelOpen(false);
  };

  if (catalog.length === 0) return null;
  if (manualBrowse) return null;

  const showTextFallback =
    !supported || state === "denied" || state === "unsupported";

  return (
    <VoiceAgentPanel
      open={panelOpen}
      onClose={handleClose}
      state={state}
      inCall={inCall}
      transcript={transcript}
      agentSpeech={agentSpeech}
      messages={messages}
      showTextFallback={showTextFallback}
      elevenLabsReady={elevenLabsReady}
      onOrbClick={handleOrbClick}
      onStartCall={() => {
        userCollapsedRef.current = false;
        setPanelOpen(true);
        startCall();
      }}
      onEndCall={endCall}
      onSubmitText={(text) => {
        userCollapsedRef.current = false;
        setPanelOpen(true);
        submitText(text);
      }}
    />
  );
}
