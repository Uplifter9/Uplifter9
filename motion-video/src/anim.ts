import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { Vo } from "./types";

export const EASE = Easing.bezier(0.16, 1, 0.3, 1);

/** Spring 0->1 starting at `delay` frames. */
export const useEnter = (delay = 0, damping = 14) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping } });
};

export const springAt = (frame: number, fps: number, delay = 0, damping = 14) =>
  spring({ frame: frame - delay, fps, config: { damping } });

/** Breathing scale between 1.00 and 1.03. */
export const breathe = (frame: number, seed = 0, fps = 30) =>
  1 + 0.015 * (1 + Math.sin((frame / fps) * Math.PI * 2 * 0.35 + seed));

/** Slow drift in px. */
export const drift = (frame: number, seed = 0, amp = 8, fps = 30) =>
  Math.sin((frame / fps) * Math.PI * 2 * 0.18 + seed) * amp;

export const ease = (frame: number, from: number, to: number, a: number, b: number) =>
  interpolate(frame, [from, to], [a, b], {
    easing: EASE,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

/** Frame at which the n-th occurrence of `word` starts in the narration (word matched by prefix). */
export const wordFrame = (vo: Vo, word: string, occurrence = 0, fps = 30) => {
  let n = 0;
  for (const w of vo.words) {
    if (w.text.includes(word)) {
      if (n === occurrence) return Math.round((w.startMs / 1000) * fps);
      n++;
    }
  }
  return 0;
};

export const pop = (p: number) => ({
  opacity: Math.min(1, p * 1.4),
  transform: `scale(${0.6 + 0.4 * p})`,
});
