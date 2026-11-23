import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { ease, springAt, wordFrame } from "../anim";
import { Person } from "../characters/Person";
import { SceneFrame } from "../components/SceneFrame";
import { FONT, theme } from "../theme";
import type { SceneProps } from "../types";

const crowd = [
  { x: 150, item: "flag" as const, shirt: "#3A7BFF" },
  { x: 345, item: "sign" as const, text: "דמוקרטיה", shirt: "#E8EEF7" },
  { x: 540, item: "flag" as const, shirt: "#2BB3C0" },
  { x: 735, item: "sign" as const, text: "דמוקרטיה", shirt: "#FFB347" },
  { x: 930, item: "flag" as const, shirt: "#9D7BFF" },
];

export const S2Judicial: React.FC<SceneProps> = ({ vo, dur, exitAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fCourt = wordFrame(vo, "ובית");
  const fStrike = wordFrame(vo, "פוסל");
  const docP = springAt(frame, fps, fCourt, 13);
  const gavelP = springAt(frame, fps, fStrike, 9);
  const stampP = springAt(frame, fps, fStrike + 6, 10);
  const shake = frame > fStrike + 4 && frame < fStrike + 12 ? Math.sin(frame * 3) * 6 : 0;
  const crowdDim = ease(frame, fCourt, fCourt + 15, 1, 0.55);
  return (
    <SceneFrame vo={vo} dur={dur} exitAt={exitAt} accent={["קרעה"]} chapter={{ period: "ינואר 2023 – ינואר 2024", from: 0, to: 12 }} source="בג״ץ, פסק הדין בעניין עילת הסבירות, 1.1.2024">
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <g opacity={crowdDim}>
          {crowd.map((c, i) => {
            const p = springAt(frame, fps, 12 + i * 5, 12);
            return (
              <g key={i} opacity={Math.min(1, p * 1.5)} transform={`translate(0,${(1 - p) * 300})`}>
                <Person pose="protest" x={c.x} y={1330} scale={0.72} shirt={c.shirt} item={c.item} signText={c.text} signColor={theme.support} seed={i * 1.7} mood="neutral" />
              </g>
            );
          })}
        </g>
      </svg>
      {/* law document */}
      <div
        style={{
          position: "absolute",
          left: 240,
          top: 470 + shake,
          width: 600,
          height: 360,
          background: theme.paper,
          borderRadius: 22,
          boxShadow: "0 30px 60px rgba(0,0,0,0.45)",
          opacity: Math.min(1, docP * 1.5),
          transform: `scale(${0.6 + 0.4 * docP}) rotate(${-3 + (1 - docP) * 8}deg)`,
          direction: "rtl",
          fontFamily: FONT,
          padding: "40px 50px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ fontSize: 30, fontWeight: 700, color: "#6B7280" }}>הצעת חוק · יולי 2023</div>
        <div style={{ fontSize: 52, fontWeight: 900, color: theme.bg1, marginTop: 12, lineHeight: 1.15 }}>ביטול עילת הסבירות</div>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ height: 14, borderRadius: 7, background: "#D8D3C8", marginTop: 22, width: `${90 - i * 18}%` }} />
        ))}
        <div
          style={{
            position: "absolute",
            left: 40,
            bottom: 36,
            padding: "8px 30px",
            border: `8px solid ${theme.accent}`,
            borderRadius: 14,
            color: theme.accent,
            fontSize: 72,
            fontWeight: 900,
            opacity: Math.min(1, stampP * 1.5),
            transform: `rotate(-12deg) scale(${2.2 - 1.2 * stampP})`,
          }}
        >
          בוטל
        </div>
      </div>
      {/* gavel */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: Math.min(1, docP * 1.5) }}>
        <g transform={`translate(930,830) rotate(${20 - 45 * gavelP})`}>
          <rect x={-14} y={-10} width={28} height={230} rx={12} fill="#8A5A33" transform="rotate(180)" />
          <rect x={-70} y={-270} width={140} height={70} rx={18} fill="#6B4226" />
          <rect x={-78} y={-262} width={18} height={54} rx={6} fill="#C9A227" />
          <rect x={60} y={-262} width={18} height={54} rx={6} fill="#C9A227" />
        </g>
      </svg>
      <div style={{ position: "absolute", top: 830, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontSize: 40, fontWeight: 700, color: theme.yellow, opacity: Math.min(1, stampP * 1.5), direction: "rtl" }}>
        בג״ץ, 1 בינואר 2024
      </div>
    </SceneFrame>
  );
};
