import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { EASE, ease, springAt } from "../anim";
import { Counter } from "../components/Counter";
import { SceneFrame } from "../components/SceneFrame";
import { FONT, theme } from "../theme";
import type { SceneProps } from "../types";

const MONTHS = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];

export const S4Hostages: React.FC<SceneProps> = ({ vo, dur, exitAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fBack = Math.round(dur * 0.5);
  const calP = springAt(frame, fps, 10, 13);
  // flip months from Oct 2023 (index 0) to Oct 2025 (index 24)
  const m = interpolate(frame, [12, fBack], [0, 24], { easing: EASE, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const idx = Math.floor(m);
  const frac = m - idx;
  const flip = idx < 24 ? Math.abs(Math.cos(frac * Math.PI)) : 1;
  const monthIdx = (9 + idx) % 12;
  const year = 2023 + Math.floor((9 + idx) / 12);
  const ribbonP = ease(frame, 8, 50, 0, 1);
  const done = idx >= 24;
  return (
    <SceneFrame vo={vo} dur={dur} exitAt={exitAt} variant="warm" accent={["משנתיים"]} accentColor={theme.yellow} chapter={{ period: "אוקטובר 2023 – אוקטובר 2025", from: 9, to: 33 }} source="AP · Axios, 13.10.2025">
      {/* yellow ribbon, drawn in */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(220,${760 + Math.sin(frame / 20) * 6}) rotate(${Math.sin(frame / 25) * 3})`}>
          <path
            d="M 0 -150 C -90 -150 -90 -40 0 0 C 90 -40 90 -150 0 -150 M 0 0 L -70 170 M 0 0 L 70 170"
            fill="none"
            stroke={theme.yellow}
            strokeWidth={34}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={1200}
            strokeDashoffset={1200 * (1 - ribbonP)}
          />
        </g>
      </svg>
      {/* flipping calendar */}
      <div
        style={{
          position: "absolute",
          left: 430,
          top: 520,
          width: 520,
          height: 470,
          borderRadius: 30,
          background: theme.paper,
          boxShadow: "0 30px 60px rgba(0,0,0,0.45)",
          overflow: "hidden",
          fontFamily: FONT,
          direction: "rtl",
          opacity: Math.min(1, calP * 1.5),
          transform: `scale(${0.6 + 0.4 * calP})`,
        }}
      >
        <div style={{ height: 120, background: done ? "#2BB673" : theme.accent, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 60, fontWeight: 900 }}>{year}</div>
        <div style={{ height: 350, display: "flex", alignItems: "center", justifyContent: "center", transform: `scaleY(${0.15 + 0.85 * flip})` }}>
          <div style={{ fontSize: 110, fontWeight: 900, color: theme.bg1 }}>{MONTHS[monthIdx]}</div>
        </div>
      </div>
      <Counter to={730} start={12} length={fBack - 12} x={540} y={1150} size={120} label="ימים בשבי, ויותר" color={theme.yellow} labelColor={theme.text} suffix="+" />
    </SceneFrame>
  );
};
