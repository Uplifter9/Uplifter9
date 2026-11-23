import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { drift, ease, springAt } from "../anim";
import { Person } from "../characters/Person";
import { SceneFrame } from "../components/SceneFrame";
import { FONT, theme } from "../theme";
import type { SceneProps } from "../types";
import { useTalk } from "../useTalk";

const YEARS = ["2023", "2024", "2025", "2026"];

export const S1Intro: React.FC<SceneProps> = ({ vo, dur, exitAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const talk = useTalk(vo);
  const lineP = ease(frame, 10, 45, 0, 1);
  const walkIn = ease(frame, 0, 42, 1300, 540);
  const pose = frame < 42 ? "walk" : frame < 120 ? "wave" : "point";
  const lineY = 700;
  const x0 = 900;
  const x1 = 180; // RTL: 2023 on the right
  return (
    <SceneFrame vo={vo} dur={dur} exitAt={exitAt} accent={["4", "אחת"]}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <line x1={x0} y1={lineY} x2={x0 + (x1 - x0) * lineP} y2={lineY} stroke={theme.supportSoft} strokeWidth={8} strokeLinecap="round" opacity={0.7} />
        {YEARS.map((yr, i) => {
          const cx = x0 + ((x1 - x0) * i) / 3;
          const p = springAt(frame, fps, 18 + i * 6, 12);
          const dy = drift(frame, i, 5);
          return (
            <g key={yr} transform={`translate(${cx},${lineY + dy}) scale(${p})`} opacity={Math.min(1, p * 1.5)}>
              <circle r={34} fill={i === 3 ? theme.accent : theme.support} />
              <circle r={14} fill={theme.text} />
              <text y={-62} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={52} fill={theme.text}>
                {yr}
              </text>
            </g>
          );
        })}
        <Person pose={pose} x={walkIn} y={1340} scale={1.25} shirt={theme.support} talk={frame > 42 ? talk : 0} seed={1} />
      </svg>
      <div style={{ position: "absolute", top: 820, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontSize: 40, fontWeight: 700, color: theme.muted, opacity: ease(frame, 40, 60, 0, 1), direction: "rtl" }}>
        דצמבר 2022 – נובמבר 2026
      </div>
    </SceneFrame>
  );
};
