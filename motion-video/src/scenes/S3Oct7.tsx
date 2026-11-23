import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ease, springAt, wordFrame } from "../anim";
import { Counter } from "../components/Counter";
import { SceneFrame } from "../components/SceneFrame";
import { FONT } from "../theme";
import type { SceneProps } from "../types";

const RED = "#FF2D2D";

// Stylised map of the Gaza envelope (north up). Schematic, not to scale.
const STRIP = "M 250 560 L 330 560 L 470 980 L 395 1000 Z";
const FENCE = "M 345 545 L 488 975";
const SITES = [
  { name: "כפר עזה", x: 470, y: 640 },
  { name: "בארי", x: 560, y: 760 },
  { name: "מסיבת נובה", x: 640, y: 845 },
  { name: "ניר עוז", x: 590, y: 950 },
];
const TARGETS = [
  { x: 950, y: 610, label: "תל אביב" },
  { x: 900, y: 1010, label: "באר שבע" },
  { x: 760, y: 560, label: "" },
  { x: 830, y: 700, label: "" },
  { x: 700, y: 980, label: "" },
];

/** More graphic, high-intensity treatment: red alert, clock, breach map, counters. */
export const S3Oct7: React.FC<SceneProps> = ({ vo, dur, exitAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fBreach = wordFrame(vo, "פורץ");
  const f1 = wordFrame(vo, "כאלף");
  const f2 = wordFrame(vo, "ומאתיים", 1);
  const t = frame / fps;

  // red alert: siren pulse during the first seconds, then a slow heartbeat
  const sirenOn = frame < fBreach + 30;
  const siren = sirenOn ? 0.5 + 0.5 * Math.sin(t * Math.PI * 2 * 1.4) : 0.15 + 0.1 * Math.sin(t * 2);
  // glitch jitter on the clock
  const jit = frame < 40 && frame % 5 < 2 ? 6 : 0;
  const clockP = springAt(frame, fps, 6, 10);
  const mapP = springAt(frame, fps, 14, 14);

  return (
    <SceneFrame vo={vo} dur={dur} exitAt={exitAt} variant="dark" accent={["המחדל"]} accentColor={RED} headlineSize={70} chapter={{ period: "7 באוקטובר 2023", from: 9, to: 9.5 }} source="רשויות ישראל · Jewish Virtual Library · AP">
      {/* pulsing red alert overlay */}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, rgba(255,0,0,0) 30%, rgba(255,20,20,${0.45 * siren}) 100%)`, pointerEvents: "none" }} />
      {/* alert ticker */}
      <div style={{ position: "absolute", top: 440, left: 0, right: 0, height: 64, background: `rgba(200,0,0,${0.55 + 0.35 * siren})`, overflow: "hidden", opacity: ease(frame, 0, 10, 0, 1) }}>
        <div style={{ position: "absolute", whiteSpace: "nowrap", top: 8, right: -2000 + ((frame * 9) % 2000), fontFamily: FONT, fontWeight: 900, fontSize: 40, color: "#fff", direction: "rtl" }}>
          {"צבע אדום · צבע אדום · צבע אדום · צבע אדום · צבע אדום · צבע אדום · צבע אדום · צבע אדום · צבע אדום · צבע אדום ·"}
        </div>
      </div>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <marker id="arr" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={RED} />
          </marker>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          </pattern>
        </defs>
        <g opacity={Math.min(1, mapP * 1.4)} transform={`translate(0,${(1 - mapP) * 60})`}>
          <rect x={150} y={530} width={860} height={510} rx={18} fill="url(#grid)" stroke="rgba(255,255,255,0.12)" strokeWidth={2} />
          <path d={STRIP} fill="#3A1212" stroke="#7A2A2A" strokeWidth={3} />
          <text x={330} y={800} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={36} fill="#C76A6A" transform="rotate(-70 330 800)">
            רצועת עזה
          </text>
          {/* the fence: flashes and breaks at the breach */}
          <path d={FENCE} stroke={frame > fBreach ? RED : "#E8C547"} strokeWidth={6} strokeDasharray="14 10" opacity={frame > fBreach ? 0.6 + 0.4 * Math.sin(t * 20) : 1} />
          {/* rocket trails from the strip */}
          {TARGETS.map((tg, i) => {
            const s = 8 + i * 4;
            const p = ease(frame, s, s + 22, 0, 1);
            const sx = 330 + i * 20;
            const sy = 700 + i * 50;
            const cx = (sx + tg.x) / 2;
            const cy = Math.min(sy, tg.y) - 180;
            const len = 900;
            return (
              <g key={i}>
                <path d={`M ${sx} ${sy} Q ${cx} ${cy} ${tg.x} ${tg.y}`} fill="none" stroke="#FFB347" strokeWidth={4} strokeDasharray={len} strokeDashoffset={len * (1 - p)} opacity={0.85} />
                {p >= 1 ? <circle cx={tg.x} cy={tg.y} r={8 + 30 * ((t * 1.5 + i * 0.3) % 1)} fill="none" stroke="#FFB347" strokeWidth={3} opacity={1 - ((t * 1.5 + i * 0.3) % 1)} /> : null}
                {tg.label && p >= 1 ? (
                  <text x={tg.x} y={tg.y - 20} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={26} fill="#FFD9A0">
                    {tg.label}
                  </text>
                ) : null}
              </g>
            );
          })}
          {/* breach arrows to the communities */}
          {SITES.map((st, i) => {
            const s = fBreach + i * 5;
            const p = ease(frame, s, s + 14, 0, 1);
            const ax = 400 + (st.y - 560) * 0.3;
            const ay = st.y + 10;
            const ex = ax + (st.x - ax) * p;
            const ey = ay + (st.y - ay) * p;
            const dot = springAt(frame, fps, s + 12, 9);
            const ring = (t * 1.2 + i * 0.25) % 1;
            return (
              <g key={st.name}>
                {p > 0 ? <line x1={ax} y1={ay} x2={ex} y2={ey} stroke={RED} strokeWidth={9} markerEnd="url(#arr)" /> : null}
                <g opacity={Math.min(1, dot * 1.5)}>
                  <circle cx={st.x} cy={st.y} r={12 + 50 * ring} fill="none" stroke={RED} strokeWidth={4} opacity={1 - ring} />
                  <circle cx={st.x} cy={st.y} r={14 * dot} fill={RED} />
                  <text x={st.x + 26} y={st.y + 10} textAnchor="start" fontFamily={FONT} fontWeight={800} fontSize={32} fill="#fff" stroke="#000" strokeWidth={6} paintOrder="stroke">
                    {st.name}
                  </text>
                </g>
              </g>
            );
          })}
        </g>
      </svg>
      {/* clock */}
      <div style={{ position: "absolute", top: 1050, left: 0, right: 0, margin: "0 auto", width: 330, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 96, color: "#fff", direction: "ltr", opacity: Math.min(1, clockP * 1.5), transform: `scale(${0.6 + 0.4 * clockP}) translateX(${jit}px)`, background: "rgba(0,0,0,0.6)", padding: "0 22px", borderRadius: 14, textShadow: `${jit}px 0 ${RED}, ${-jit}px 0 #2DE1FF, 0 8px 30px rgba(0,0,0,0.6)` }}>
        06:29
      </div>
      <Counter to={1200} start={f1} length={40} x={300} y={1300} size={110} label="נרצחים" color="#FFFFFF" labelColor="#F2C6C0" prefix="~" />
      <Counter to={251} start={f2} length={36} x={780} y={1300} size={110} label="חטופים" color={RED} labelColor="#F2C6C0" />
      {/* black flash at the breach */}
      <AbsoluteFill style={{ background: "#fff", opacity: interpolate(frame, [fBreach, fBreach + 2, fBreach + 8], [0, 0.35, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), pointerEvents: "none" }} />
    </SceneFrame>
  );
};
