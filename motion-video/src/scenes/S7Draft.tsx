import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { springAt, wordFrame } from "../anim";
import { Person } from "../characters/Person";
import { SceneFrame } from "../components/SceneFrame";
import { FONT, theme } from "../theme";
import type { SceneProps } from "../types";

export const S7Draft: React.FC<SceneProps> = ({ vo, dur, exitAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fLaw = wordFrame(vo, "מאשרת");
  const scaleP = springAt(frame, fps, 6, 12);
  const tiltP = springAt(frame, fps, 30, 6); // underdamped wobble
  const tilt = 14 * tiltP + Math.sin(frame / 14) * 0.8; // right side (reservist) down
  const cardP = springAt(frame, fps, fLaw, 13);
  const cx = 540;
  const cy = 760;
  const half = 330;
  const rad = (tilt * Math.PI) / 180;
  const R = { x: cx + half * Math.cos(rad), y: cy + half * Math.sin(rad) };
  const L = { x: cx - half * Math.cos(rad), y: cy - half * Math.sin(rad) };
  const hang = 170;
  const Pan: React.FC<{ x: number; y: number }> = ({ x, y }) => (
    <g>
      <line x1={x} y1={y} x2={x - 100} y2={y + hang} stroke={theme.muted} strokeWidth={4} />
      <line x1={x} y1={y} x2={x + 100} y2={y + hang} stroke={theme.muted} strokeWidth={4} />
      <path d={`M ${x - 125} ${y + hang} Q ${x} ${y + hang + 50} ${x + 125} ${y + hang} Z`} fill={theme.yellow} />
    </g>
  );
  return (
    <SceneFrame vo={vo} dur={dur} exitAt={exitAt} accent={["לא"]} chapter={{ period: "יולי 2026", from: 42, to: 42.6 }} source="Times of Israel, יולי 2026">
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <g opacity={Math.min(1, scaleP * 1.5)} transform={`translate(0,${(1 - scaleP) * 200})`}>
          <rect x={cx - 16} y={cy} width={32} height={520} rx={10} fill={theme.supportSoft} />
          <rect x={cx - 150} y={cy + 510} width={300} height={34} rx={17} fill={theme.supportSoft} />
          <line x1={L.x} y1={L.y} x2={R.x} y2={R.y} stroke={theme.supportSoft} strokeWidth={22} strokeLinecap="round" />
          <circle cx={cx} cy={cy} r={26} fill={theme.yellow} />
          <Pan x={L.x} y={L.y} />
          <Pan x={R.x} y={R.y} />
          <Person pose="tired" x={R.x} y={R.y + hang + 8} scale={0.62} shirt={theme.olive} pants={theme.oliveDark} backpack helmet mood="sad" seed={3} />
          <text x={L.x} y={L.y + hang - 20} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill={theme.text}>
            פטור
          </text>
          <text x={R.x} y={R.y + hang + 90} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={36} fill={theme.muted}>
            מילואים
          </text>
        </g>
      </svg>
      <div
        style={{
          position: "absolute",
          left: 90,
          top: 470,
          width: 900,
          padding: "26px 30px",
          boxSizing: "border-box",
          borderRadius: 24,
          background: theme.paper,
          color: theme.bg1,
          fontFamily: FONT,
          direction: "rtl",
          textAlign: "center",
          boxShadow: "0 24px 50px rgba(0,0,0,0.4)",
          opacity: Math.min(1, cardP * 1.5),
          transform: `scale(${0.6 + 0.4 * cardP})`,
        }}
      >
        <div style={{ fontSize: 30, fontWeight: 700, color: theme.accent }}>יולי 2026</div>
        <div style={{ fontSize: 46, fontWeight: 900 }}>חוק: אין מעצר למשתמטים</div>
      </div>
    </SceneFrame>
  );
};
