import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { EASE, springAt } from "../anim";
import { Person } from "../characters/Person";
import { SceneFrame } from "../components/SceneFrame";
import { FONT, theme } from "../theme";
import type { SceneProps } from "../types";
import { useTalk } from "../useTalk";

const I = { stroke: theme.bg1, strokeWidth: 6, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const ICONS: { label: string; color: string; glyph: React.ReactNode }[] = [
  { label: "משפט", color: theme.support, glyph: (<g {...I}><line x1={0} y1={-26} x2={0} y2={24} /><line x1={-26} y1={-18} x2={26} y2={-18} /><path d="M -26 -18 L -36 6 L -16 6 Z" /><path d="M 26 -18 L 16 6 L 36 6 Z" /><line x1={-14} y1={26} x2={14} y2={26} /></g>) },
  { label: "7.10", color: "#FF5A4E", glyph: (<g {...I}><path d="M 0 -28 C 18 -6 16 14 0 24 C -16 14 -18 -6 0 -28 Z" /></g>) },
  { label: "הצפון", color: "#2BB3C0", glyph: (<g {...I}><path d="M -28 0 L 0 -26 L 28 0" /><path d="M -20 -6 L -20 24 L 20 24 L 20 -6" /></g>) },
  { label: "יוקר", color: theme.yellow, glyph: (<g {...I}><path d="M -30 -20 L -20 -20 L -12 14 L 22 14 L 30 -10 L -16 -10" /><circle cx={-8} cy={24} r={3} /><circle cx={18} cy={24} r={3} /></g>) },
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
            <svg width={90} height={70} viewBox="-45 -35 90 70">{ic.glyph}</svg>
            <div style={{ fontSize: 30, fontWeight: 900, direction: "rtl" }}>{ic.label}</div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: cy - 78, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 120, color: theme.text, direction: "rtl", opacity: Math.min(1, titleP * 1.5), transform: `scale(${(0.6 + 0.4 * titleP) * (1 + 0.015 * Math.sin(frame / 10))})`, textShadow: "0 10px 40px rgba(0,0,0,0.5)" }}>
        4 שנים
      </div>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <Person pose={frame < 60 ? "idle" : "point"} x={540} y={1360} scale={0.95} shirt="#46587A" pants="#2A3448" suit talk={talk} mood="neutral" seed={1} />
      </svg>
    </SceneFrame>
  );
};
