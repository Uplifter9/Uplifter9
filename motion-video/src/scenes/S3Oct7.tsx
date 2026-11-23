import React from "react";
import { useCurrentFrame } from "remotion";
import { ease, wordFrame } from "../anim";
import { Counter } from "../components/Counter";
import { SceneFrame } from "../components/SceneFrame";
import type { SceneProps } from "../types";

/** Somber scene: no animated characters. */
export const S3Oct7: React.FC<SceneProps> = ({ vo, dur, exitAt }) => {
  const frame = useCurrentFrame();
  const f1 = wordFrame(vo, "כאלף");
  const f2 = wordFrame(vo, "ומאתיים", 1);
  const t = frame / 30;
  const flicker = 1 + 0.08 * Math.sin(t * 13) + 0.05 * Math.sin(t * 7.3 + 1);
  const glow = ease(frame, 0, 40, 0, 1);
  return (
    <SceneFrame vo={vo} dur={dur} exitAt={exitAt} variant="dark" accent={["הכישלון"]} accentColor="#FF6B57">
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <radialGradient id="glow">
            <stop offset="0%" stopColor="#FFB547" stopOpacity={0.55} />
            <stop offset="100%" stopColor="#FFB547" stopOpacity={0} />
          </radialGradient>
        </defs>
        <g transform={`translate(540,${1120 + Math.sin(t * 0.8) * 4})`} opacity={glow}>
          <circle cx={0} cy={-110} r={180 * flicker} fill="url(#glow)" />
          <rect x={-38} y={-60} width={76} height={230} rx={10} fill="#EDE6D6" />
          <rect x={-38} y={-60} width={76} height={18} rx={8} fill="#D8CFBC" />
          <line x1={0} y1={-60} x2={0} y2={-80} stroke="#333" strokeWidth={4} />
          <g transform={`translate(0,-82) scale(${1 / flicker + 0.1},${flicker})`}>
            <path d="M 0 -70 C 22 -36 20 -8 0 0 C -20 -8 -22 -36 0 -70 Z" fill="#FFB547" />
            <path d="M 0 -42 C 10 -24 9 -8 0 -3 C -9 -8 -10 -24 0 -42 Z" fill="#FFF2C6" />
          </g>
        </g>
      </svg>
      <Counter to={1200} start={f1} length={45} x={290} y={620} size={130} label="נרצחים" color="#FFFFFF" labelColor="#E7C9C0" prefix="~" />
      <Counter to={251} start={f2} length={40} x={790} y={620} size={130} label="חטופים" color="#FF6B57" labelColor="#E7C9C0" />
    </SceneFrame>
  );
};
