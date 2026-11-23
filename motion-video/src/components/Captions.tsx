import React, { useMemo } from "react";
import { createTikTokStyleCaptions, type Caption } from "@remotion/captions";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { springAt } from "../anim";
import type { Word } from "../types";
import { FONT, theme } from "../theme";

/** Burned-in captions: 1-2 lines, bottom third, active word highlighted. RTL. */
export const Captions: React.FC<{ words: Word[]; bottom?: number }> = ({ words, bottom = 250 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pages = useMemo(() => {
    const caps: Caption[] = words.map((w, i) => ({
      text: (i === 0 ? "" : " ") + w.text,
      startMs: w.startMs,
      endMs: w.endMs,
      timestampMs: (w.startMs + w.endMs) / 2,
      confidence: 1,
    }));
    return createTikTokStyleCaptions({ captions: caps, combineTokensWithinMilliseconds: 1300 }).pages;
  }, [words]);

  const t = (frame / fps) * 1000;
  const lastEnd = words.length ? words[words.length - 1].endMs : 0;
  if (t > lastEnd + 500) return null;
  const page = [...pages].reverse().find((p) => p.startMs <= t);
  if (!page) return null;
  const pageStartFrame = Math.round((page.startMs / 1000) * fps);
  const p = springAt(frame, fps, pageStartFrame, 16);

  return (
    <div
      style={{
        position: "absolute",
        bottom,
        left: 80,
        right: 80,
        display: "flex",
        justifyContent: "center",
        direction: "rtl",
      }}
    >
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 62,
          lineHeight: 1.25,
          textAlign: "center",
          maxWidth: 900,
          transform: `scale(${0.92 + 0.08 * p}) translateY(${(1 - p) * 14}px)`,
          opacity: Math.min(1, p * 2),
        }}
      >
        {page.tokens.map((tok, i) => {
          const active = t >= tok.fromMs && t < tok.toMs + 60;
          return (
            <span
              key={i}
              style={{
                color: active ? theme.yellow : "#FFFFFF",
                WebkitTextStroke: "10px rgba(5,8,14,0.85)",
                paintOrder: "stroke fill",
                textShadow: "0 4px 18px rgba(0,0,0,0.5)",
                whiteSpace: "pre",
              }}
            >
              {tok.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};
