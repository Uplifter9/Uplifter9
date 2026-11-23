import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { EASE, springAt } from "../anim";
import { Person } from "../characters/Person";
import { SceneFrame } from "../components/SceneFrame";
import { FONT, theme } from "../theme";
import type { SceneProps } from "../types";
import { useTalk } from "../useTalk";

const ICONS = [
  { label: "בג״ץ", color: theme.support, glyph: "⚖" },
  { label: "7.10", color: "#FF6B57", glyph: "🕯" },
  { label: "הצפון", color: "#2BB3C0", glyph: "⌂" },
  { label: "יוקר", color: theme.yellow, glyph: "₪" },
];

export const S9Outro: React.FC<SceneProps> = ({ vo, dur, exitAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const talk = useTalk(vo);
  const conv = interpolate(frame, [6, 40], [1, 0], { easing: EASE, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const titleP = springAt(frame, fps, 34, 12);
  const cx = 540;
  const cy = 680;
  const R = 340;
  return (
    <SceneFrame vo={vo} dur={dur} exitAt={exitAt} accent={["כולנו"]}>
      {ICONS.map((ic, i) => {
        const ang = (i / 4) * Math.PI * 2 + frame / 90 - Math.PI / 4;
        const r = R + conv * 700;
        const x = cx + Math.cos(ang) * r;
        const y = cy + Math.sin(ang) * r * 0.65;
        const p = springAt(frame, fps, 4 + i * 5, 12);
        return (
          <div key={i} style={{ position: "absolute", left: x - 85, top: y - 85, width: 170, height: 170, borderRadius: 85, background: ic.color, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: FONT, color: theme.bg1, opacity: Math.min(1, p * 1.5), transform: `scale(${0.6 + 0.4 * p})`, boxShadow: "0 16px 40px rgba(0,0,0,0.4)" }}>
            <div style={{ fontSize: 64, lineHeight: 1 }}>{ic.glyph}</div>
            <div style={{ fontSize: 30, fontWeight: 900, direction: "rtl" }}>{ic.label}</div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: cy - 78, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 120, color: theme.text, direction: "rtl", opacity: Math.min(1, titleP * 1.5), transform: `scale(${(0.6 + 0.4 * titleP) * (1 + 0.015 * Math.sin(frame / 10))})`, textShadow: "0 10px 40px rgba(0,0,0,0.5)" }}>
        4 שנים
      </div>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <Person pose={frame < 60 ? "idle" : "point"} x={540} y={1360} scale={0.95} shirt={theme.support} talk={talk} mood="neutral" seed={1} />
      </svg>
    </SceneFrame>
  );
};
