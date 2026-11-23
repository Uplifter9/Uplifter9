import React from "react";
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from "remotion";
import { EASE } from "../anim";
import type { Vo } from "../types";
import { Background } from "./Background";
import { Captions } from "./Captions";
import { KineticText } from "./KineticText";
import { ChapterBar, type Chapter } from "./Chapter";
import { FONT, theme } from "../theme";

/** Common wrapper: background, slow camera push-in, headline, narration audio, captions, exit before the cut. */
export const SceneFrame: React.FC<{
  vo: Vo;
  dur: number;
  exitAt: number;
  variant?: "normal" | "dark" | "warm" | "cool";
  accent?: string[];
  headlineColor?: string;
  accentColor?: string;
  chapter?: Chapter;
  source?: string;
  headlineTop?: number;
  headlineSize?: number;
  children: React.ReactNode;
}> = ({ vo, dur, exitAt, variant = "normal", accent, headlineColor, accentColor, chapter, source, headlineTop, headlineSize, children }) => {
  const frame = useCurrentFrame();
  const push = interpolate(frame, [0, dur], [1, 1.06]);
  const exit = interpolate(frame, [exitAt - 6, exitAt + 8], [0, 1], {
    easing: EASE,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        <Background variant={variant} />
        <AbsoluteFill
          style={{ opacity: 1 - exit, transform: `scale(${1 - exit * 0.08}) translateY(${-exit * 30}px)` }}
        >
          {chapter ? <ChapterBar chapter={chapter} accent={accentColor ?? theme.accent} /> : null}
          <KineticText text={vo.onScreenText} accent={accent} color={headlineColor} accentColor={accentColor} top={headlineTop ?? (chapter ? 240 : 190)} size={headlineSize ?? 80} />
          {children}
        </AbsoluteFill>
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: 1 - exit }}>
        <Captions words={vo.words} />
        {source ? (
          <div style={{ position: "absolute", bottom: 130, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontSize: 24, fontWeight: 400, color: theme.muted, opacity: 0.85, direction: "rtl" }}>
            מקור: {source}
          </div>
        ) : null}
      </AbsoluteFill>
      <Audio src={staticFile(`vo/${vo.id}.mp3`)} />
    </AbsoluteFill>
  );
};
