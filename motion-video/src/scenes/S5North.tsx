import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { springAt, wordFrame } from "../anim";
import { Person } from "../characters/Person";
import { Counter } from "../components/Counter";
import { SceneFrame } from "../components/SceneFrame";
import { theme } from "../theme";
import type { SceneProps } from "../types";

const House: React.FC<{ x: number; y: number; lit: boolean; p: number }> = ({ x, y, lit, p }) => (
  <g transform={`translate(${x},${y}) scale(${p})`} opacity={Math.min(1, p * 1.5)}>
    <polygon points="-60,-40 0,-95 60,-40" fill="#B5523B" />
    <rect x={-50} y={-40} width={100} height={80} fill="#E9E2D3" />
    <rect x={-34} y={-24} width={28} height={26} rx={4} fill={lit ? theme.yellow : "#39424F"} />
    <rect x={8} y={-24} width={28} height={26} rx={4} fill={lit ? theme.yellow : "#39424F"} />
    <rect x={-12} y={10} width={24} height={30} fill="#6B4226" />
  </g>
);

export const S5North: React.FC<SceneProps> = ({ vo, dur, exitAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fEvac = wordFrame(vo, "פונו");
  const houses: { x: number; y: number }[] = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) houses.push({ x: 210 + c * 220 + (r % 2) * 50, y: 780 + r * 150 });
  const walkX = interpolate(frame, [fEvac, dur], [1180, -120], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <SceneFrame vo={vo} dur={dur} exitAt={exitAt} variant="cool" accent={["60,000"]} accentColor={theme.yellow}>
      <Counter to={60000} start={4} length={45} x={540} y={540} size={140} label="תושבים פונו מבתיהם" color={theme.yellow} labelColor={theme.text} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <path d="M -20 1250 Q 300 640 600 700 Q 900 760 1100 660 L 1100 1300 L -20 1300 Z" fill="#1E4A3A" opacity={0.7} />
        {houses.map((h, i) => {
          const p = springAt(frame, fps, 6 + i * 2, 13);
          const lit = frame < fEvac + i * 4;
          return <House key={i} x={h.x} y={h.y} lit={lit} p={p} />;
        })}
        <Person pose="walkCarry" x={walkX} y={1330} scale={0.85} shirt="#E46F4E" item="suitcase" mood="sad" seed={2} />
      </svg>
    </SceneFrame>
  );
};
