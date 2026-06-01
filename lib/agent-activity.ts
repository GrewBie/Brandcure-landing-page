"use client";

import { browserNav } from "@/lib/browser-navigator";
import { cancelBrowserTts } from "@/lib/client/browser-tts";

/** Bumped when the user stops the agent or starts a new turn — stale async work must exit. */
let generation = 0;
let abortController: AbortController | null = null;

const interruptibleTimeouts = new Set<ReturnType<typeof setTimeout>>();

export class AgentActivityCancelled extends Error {
  override name = "AgentActivityCancelled";
}

export function getAgentActivityGeneration(): number {
  return generation;
}

export function isAgentActivityActive(workGen: number): boolean {
  return workGen === generation;
}

export function getAgentAbortSignal(): AbortSignal {
  if (!abortController) abortController = new AbortController();
  return abortController.signal;
}

function bumpGeneration(): number {
  generation += 1;
  abortController?.abort();
  abortController = new AbortController();
  return generation;
}

/** Stop tours, TTS, highlights, and scheduled nav — keep mic/call state to caller. */
export function cancelAgentPresentation(): number {
  const gen = bumpGeneration();

  for (const t of interruptibleTimeouts) clearTimeout(t);
  interruptibleTimeouts.clear();

  cancelBrowserTts();
  browserNav.resetAgentPresentation();

  return gen;
}

/** Full stop: presentation + invalidates all in-flight agent work. */
export function cancelAllAgentActivity(): number {
  return cancelAgentPresentation();
}

export function cancellableDelay(
  ms: number,
  workGen: number,
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!isAgentActivityActive(workGen)) {
      reject(new AgentActivityCancelled());
      return;
    }

    const id = setTimeout(() => {
      interruptibleTimeouts.delete(id);
      if (!isAgentActivityActive(workGen)) {
        reject(new AgentActivityCancelled());
        return;
      }
      resolve();
    }, ms);

    interruptibleTimeouts.add(id);
  });
}

export function isActivityCancelledError(error: unknown): boolean {
  return error instanceof AgentActivityCancelled;
}
