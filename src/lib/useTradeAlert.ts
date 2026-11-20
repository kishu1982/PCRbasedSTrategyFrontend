"use client";
import { useCallback, useEffect, useRef } from "react";
import { LiveStrategy } from "@/lib/types";

export function useTradeAlert(live: LiveStrategy[], enabled: boolean) {
  const prevLots = useRef<Map<string, number> | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);

  // Must be called from a user click once (browser autoplay policy)
  const unlock = useCallback(() => {
    if (typeof window === "undefined") return;
    if (!ctxRef.current) {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (AC) ctxRef.current = new AC();
    }
    ctxRef.current?.resume();
  }, []);

  const playAlert = useCallback(() => {
    const ctx = ctxRef.current;

    // Bell sound (two harmonics with fast decay)
    if (ctx) {
      const now = ctx.currentTime;
      [880, 1760].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(i === 0 ? 0.35 : 0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.2);
      });
    }

    // Voice: "Trade got open" (remove this block if you only want the bell)
    if ("speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance("Trade got open");
      u.rate = 1;
      u.volume = 1;
      window.speechSynthesis.speak(u);
    }
  }, []);

  useEffect(() => {
    const current = new Map<string, number>();
    live.forEach((l) => current.set(l.configId, l.totalOpenLots));

    // first load: just remember values, don't ring
    if (prevLots.current === null) {
      if (live.length > 0) prevLots.current = current;
      return;
    }

    let changed = false;
    current.forEach((lots, id) => {
      const before = prevLots.current!.get(id);
      if (before !== undefined && before !== lots) changed = true;
    });

    prevLots.current = current;
    if (changed && enabled) playAlert();
  }, [live, enabled, playAlert]);

  return { unlock, playAlert };
}
