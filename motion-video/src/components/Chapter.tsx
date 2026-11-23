import React from "react";
import { useCurrentFrame } from "remotion";
import { ease, springAt } from "../anim";
import { FONT, theme } from "../theme";

/** Month index from Jan 2023 (0) to Dec 2026 (47). */
export type Chapter = { period: string; from: number; to: number };

const X0 = 950; // Jan 2023 (RTL: time runs right -> left)
const X1 = 130; // Dec 2026
const mx = (m: number) => X0 + ((X1 - X0) * m) / 47;

/** Running timeline 2023-2026 with the scene's period highlighted, plus a date pill. */
export const ChapterBar: React.FC<{ chapter: Chapter; accent?: string }> = ({ chapter, accent = theme.accent }) => {
  const frame = useCurrentFrame();
  const appear = springAt(frame, 30, 0, 16);
  const grow = ease(frame, 4, 26, 0, 1);
  const a = mx(chapter.from);
  const b = mx(chapter.from + Math.max(0.6, chapter.to - chapter.from) * grow);
  const pill = springAt(frame, 30, 8, 14);
  return (
    <>
      <svg width={1080} height={240} style={{ position: "absolute", top: 0, left: 0, opacity: appear }}>
        <line x1={X0} y1={120} x2={X1} y2={120} stroke="rgba(255,255,255,0.22)" strokeWidth={4} />
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <line x1={mx(i * 12)} y1={110} x2={mx(i * 12)} y2={130} stroke="rgba(255,255,255,0.35)" strokeWidth={3} />
            <text x={mx(i * 12 + 6)} y={98} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={28} fill={theme.muted}>
              {2023 + i}
            </text>
          </g>
        ))}
        <line x1={a} y1={120} x2={b} y2={120} stroke={accent} strokeWidth={10} strokeLinecap="round" />
        <circle cx={b} cy={120} r={11 + Math.sin(frame / 6) * 2} fill={accent} />
      </svg>
      <div style={{ position: "absolute", top: 152, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: Math.min(1, pill * 1.5), transform: `scale(${0.7 + 0.3 * pill})` }}>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 32, color: "#fff", background: accent, padding: "6px 26px", borderRadius: 40, direction: "rtl", letterSpacing: 0.5 }}>{chapter.period}</div>
      </div>
    </>
  );
};
