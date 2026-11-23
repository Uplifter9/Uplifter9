import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { ease, springAt, wordFrame } from "../anim";
import { SceneFrame } from "../components/SceneFrame";
import { FONT, theme } from "../theme";
import type { SceneProps } from "../types";

export const S8Inquiry: React.FC<SceneProps> = ({ vo, dur, exitAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fRefuse = wordFrame(vo, "סירבה");
  const fCourt = wordFrame(vo, "לבג");
  const doorP = springAt(frame, fps, 4, 13);
  const close = ease(frame, fRefuse + 4, fRefuse + 22, 0, 1);
  const lockP = springAt(frame, fps, fRefuse + 22, 10);
  const quoteP = springAt(frame, fps, fCourt, 13);
  const qSwing = Math.sin(frame / 12) * 12;
  const dx = 380;
  const dy = 520;
  const dw = 340;
  const dh = 560;
  return (
    <SceneFrame vo={vo} dur={dur} exitAt={exitAt} variant="warm" accent={["ועדת"]} accentColor={theme.yellow}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <g opacity={Math.min(1, doorP * 1.5)} transform={`translate(0,${(1 - doorP) * 150})`}>
          <rect x={dx - 120} y={dy - 140} width={dw + 240} height={110} rx={18} fill={theme.paper} />
          <text x={dx + dw / 2} y={dy - 72} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill={theme.bg1}>
            ועדת חקירה ממלכתית
          </text>
          <rect x={dx - 20} y={dy - 20} width={dw + 40} height={dh + 20} rx={10} fill="#4A3426" />
          <rect x={dx} y={dy} width={dw} height={dh} fill="#0A0A0E" />
          {/* door panel hinged on the right, closes */}
          <g>
            <rect x={dx + dw - dw * (0.18 + 0.82 * close)} y={dy} width={dw * (0.18 + 0.82 * close)} height={dh} fill="#9A6B47" />
            <circle cx={dx + dw - dw * (0.18 + 0.82 * close) + 36} cy={dy + dh / 2} r={14} fill={theme.yellow} opacity={close} />
          </g>
          <g transform={`translate(${dx + dw / 2},${dy + dh / 2 - 30}) scale(${lockP})`} opacity={Math.min(1, lockP * 1.5)}>
            <path d="M -40 -10 L -40 -45 A 40 40 0 0 1 40 -45 L 40 -10" fill="none" stroke="#DDE3EA" strokeWidth={16} />
            <rect x={-60} y={-14} width={120} height={100} rx={16} fill={theme.accent} />
            <circle cx={0} cy={28} r={12} fill={theme.bg1} />
          </g>
        </g>
      </svg>
      <div style={{ position: "absolute", left: 40, top: 560, fontFamily: FONT, fontWeight: 900, fontSize: 300, color: theme.accent, transformOrigin: "50% 0%", transform: `rotate(${qSwing}deg) scale(${springAt(frame, fps, 14, 10)})`, textShadow: "0 10px 40px rgba(0,0,0,0.5)" }}>
        ?
      </div>
      <div style={{ position: "absolute", left: 140, right: 140, top: 1170, padding: "22px 20px", borderRadius: 22, background: "rgba(255,255,255,0.1)", border: "3px solid rgba(255,255,255,0.2)", fontFamily: FONT, direction: "rtl", textAlign: "center", opacity: Math.min(1, quoteP * 1.5), transform: `scale(${0.6 + 0.4 * quoteP})` }}>
        <div style={{ fontSize: 30, fontWeight: 700, color: theme.muted }}>הממשלה לבג״ץ:</div>
        <div style={{ fontSize: 50, fontWeight: 900, color: theme.text }}>לא לפני הבחירות</div>
      </div>
    </SceneFrame>
  );
};
