import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { ease, springAt, wordFrame } from "../anim";
import { Counter } from "../components/Counter";
import { SceneFrame } from "../components/SceneFrame";
import { FONT, theme } from "../theme";
import type { SceneProps } from "../types";

// Moody's: A1 -> A2 (Feb 2024) -> Baa1 (Sep 2024)
const PTS = [
  { x: 840, y: 620, r: "A1", d: "עד 2024" },
  { x: 540, y: 740, r: "A2", d: "פבר׳ 2024" },
  { x: 220, y: 870, r: "Baa1", d: "ספט׳ 2024" },
];

export const S6Economy: React.FC<SceneProps> = ({ vo, dur, exitAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fVat = wordFrame(vo, "מס");
  const fFood = wordFrame(vo, "ולפי");
  const lineP = ease(frame, 15, 75, 0, 1);
  const DELAYS = [15, 22, 42];
  const vatP = springAt(frame, fps, fVat, 13);
  const cartP = springAt(frame, fps, fFood, 13);
  const len = 760;
  return (
    <SceneFrame vo={vo} dur={dur} exitAt={exitAt} accent={["יורד", "מתייקר"]} chapter={{ period: "פברואר 2024 – ינואר 2025", from: 13, to: 24 }} source="Moody's · משרד האוצר · i24NEWS">
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <text x={540} y={490} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={38} fill={theme.muted}>
          דירוג האשראי של ישראל (Moody's)
        </text>
        <polyline
          points={PTS.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke={theme.accent}
          strokeWidth={12}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={len}
          strokeDashoffset={len * (1 - lineP)}
        />
        {PTS.map((p, i) => {
          const s = springAt(frame, fps, DELAYS[i], 11);
          return (
            <g key={i} transform={`translate(${p.x},${p.y}) scale(${s})`} opacity={Math.min(1, s * 1.5)}>
              <circle r={26} fill={i === 0 ? theme.support : theme.accent} stroke="#fff" strokeWidth={6} />
              <text y={-48} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={50} fill={theme.text}>
                {p.r}
              </text>
              <text y={70} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={30} fill={theme.muted}>
                {p.d}
              </text>
            </g>
          );
        })}
      </svg>
      {/* VAT badge */}
      <div style={{ position: "absolute", right: 90, top: 1000, width: 400, height: 330, borderRadius: 30, background: "rgba(255,255,255,0.08)", border: "3px solid rgba(255,255,255,0.15)", opacity: Math.min(1, vatP * 1.5), transform: `scale(${0.6 + 0.4 * vatP})` }}>
        <div style={{ textAlign: "center", fontFamily: FONT, fontSize: 44, fontWeight: 700, color: theme.text, marginTop: 30, direction: "rtl" }}>מע״מ</div>
      </div>
      <Counter to={18} from={17} start={fVat + 6} length={20} x={290 + 400} y={1200} size={130} suffix="%" color={theme.yellow} />
      {/* food cart */}
      <div style={{ position: "absolute", left: 90, top: 1000, width: 400, height: 330, borderRadius: 30, background: "rgba(255,255,255,0.08)", border: "3px solid rgba(255,255,255,0.15)", opacity: Math.min(1, cartP * 1.5), transform: `scale(${0.6 + 0.4 * cartP})` }}>
        <div style={{ textAlign: "center", fontFamily: FONT, fontSize: 44, fontWeight: 700, color: theme.text, marginTop: 30, direction: "rtl" }}>מחירי המזון</div>
        <svg width={400} height={120} style={{ position: "absolute", top: 200 }}>
          <g transform={`translate(${200 + Math.sin(frame / 6) * 6},10)`}>
            <path d="M -90 10 L -60 10 L -40 80 L 60 80 L 80 25 L -52 25" fill="none" stroke={theme.text} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={-30} cy={100} r={10} fill={theme.text} />
            <circle cx={50} cy={100} r={10} fill={theme.text} />
          </g>
        </svg>
      </div>
      <Counter to={20} start={fFood + 6} length={30} x={290} y={1160} size={110} prefix="~+" suffix="%" color={theme.accent} />
    </SceneFrame>
  );
};
