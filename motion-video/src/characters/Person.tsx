import React from "react";
import { useCurrentFrame } from "remotion";
import { FONT, theme } from "../theme";

/**
 * Rigged flat-vector character. Each limb is a nested <g> rotated at its joint
 * (shoulder -> elbow, hip -> knee), so moving a parent moves its children.
 * Figure space: feet at y=370, head at top (y~10). Placed by its feet at (x, y).
 */
export type Pose = "idle" | "wave" | "walk" | "point" | "think" | "celebrate" | "protest" | "walkCarry" | "tired";

export type PersonProps = {
  pose: Pose;
  x: number;
  y: number;
  scale?: number;
  shirt?: string;
  pants?: string;
  skin?: string;
  hair?: string;
  /** mouth opening 0..1 (driven by narration volume) */
  talk?: number;
  mood?: "smile" | "neutral" | "sad";
  item?: "none" | "sign" | "flag" | "suitcase";
  signText?: string;
  signColor?: string;
  backpack?: boolean;
  helmet?: boolean;
  seed?: number;
  flip?: boolean;
};

const UA = 60; // upper arm length
const FA = 55; // forearm
const TH = 75; // thigh
const SH = 72; // shin

type Angles = { uaR: number; faR: number; uaL: number; faL: number; thR: number; shR: number; thL: number; shL: number; bob: number; lean: number; head: number };

const poseAngles = (pose: Pose, t: number, seed: number): Angles => {
  const s = Math.sin;
  const base: Angles = {
    uaR: -8 + s(t * 2 + seed) * 3,
    faR: -8,
    uaL: 8 - s(t * 2 + seed) * 3,
    faL: 8,
    thR: 0,
    shR: 0,
    thL: 0,
    shL: 0,
    bob: s(t * 2.2 + seed) * 2,
    lean: 0,
    head: s(t * 1.3 + seed) * 2,
  };
  const walkLegs = () => {
    const ph = t * Math.PI * 2 * 1.5 + seed;
    // thighs +/-25deg in opposite phase; shins follow with a 0.25-cycle delay
    base.thL = 25 * s(ph);
    base.thR = -25 * s(ph);
    base.shL = 22 + 22 * s(ph - Math.PI / 2);
    base.shR = 22 + 22 * s(ph + Math.PI / 2);
    base.bob = Math.abs(s(ph)) * 7;
    return ph;
  };
  switch (pose) {
    case "wave":
      base.uaR = -130 + s(t * 2) * 4;
      base.faR = -25 + 20 * s(t * Math.PI * 2 * 3); // 3 Hz
      break;
    case "walk": {
      const ph = walkLegs();
      base.uaR = -4 + 22 * s(ph);
      base.uaL = 4 + 22 * s(ph);
      base.faR = -15;
      base.faL = 15;
      break;
    }
    case "walkCarry": {
      const ph = walkLegs();
      base.uaR = -3 + 3 * s(ph);
      base.faR = 0;
      base.uaL = 4 + 20 * s(ph);
      base.faL = 15;
      base.lean = 4;
      base.head = -6;
      break;
    }
    case "point":
      base.uaR = -85 + s(t * 3) * 3;
      base.faR = -8;
      break;
    case "think":
      base.uaR = 20;
      base.faR = 155 + s(t * 2) * 3;
      base.uaL = -15;
      base.faL = -95;
      base.head = 6 + s(t * 1.5) * 2;
      break;
    case "celebrate":
      base.uaR = -150 + 12 * s(t * 8 + seed);
      base.faR = -12;
      base.uaL = 150 - 12 * s(t * 8 + seed);
      base.faL = 12;
      base.bob = Math.abs(s(t * 6 + seed)) * 18;
      break;
    case "protest":
      base.uaR = -172 + s(t * 5 + seed) * 4;
      base.faR = 2;
      base.uaL = 140 + 18 * s(t * 6 + seed);
      base.faL = 25 + 10 * s(t * 6 + seed);
      base.bob = Math.abs(s(t * 4.5 + seed)) * 9;
      break;
    case "tired":
      base.uaR = -3 + s(t * 1.2) * 2;
      base.faR = -4;
      base.uaL = 3 - s(t * 1.2) * 2;
      base.faL = 4;
      base.thR = -6;
      base.shR = 10;
      base.thL = 6;
      base.shL = -10;
      base.lean = 8 + s(t * 1.4) * 2;
      base.head = 14 + s(t * 1.4) * 2;
      base.bob = -6 + s(t * 1.4) * 3;
      break;
    default:
      break;
  }
  return base;
};

const HandItem: React.FC<{ item: PersonProps["item"]; text?: string; color?: string; t: number; seed: number }> = ({ item, text, color = theme.support, t, seed }) => {
  if (item === "sign") {
    return (
      <g>
        <line x1={0} y1={6} x2={0} y2={-120} stroke="#8A5A33" strokeWidth={9} strokeLinecap="round" />
        <rect x={-92} y={-215} width={184} height={100} rx={10} fill={theme.paper} stroke="#0003" strokeWidth={3} />
        <text x={0} y={-152} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={color}>
          {text}
        </text>
      </g>
    );
  }
  if (item === "flag") {
    const wave = Math.sin(t * 5 + seed) * 6;
    return (
      <g>
        <line x1={0} y1={6} x2={0} y2={-170} stroke="#CFD6E0" strokeWidth={7} strokeLinecap="round" />
        <g transform={`translate(0,-168) skewY(${wave * 0.6})`}>
          <rect x={0} y={0} width={130} height={92} fill="#FFFFFF" />
          <rect x={0} y={10} width={130} height={12} fill="#1F5FD6" />
          <rect x={0} y={70} width={130} height={12} fill="#1F5FD6" />
          <polygon points="65,30 79,54 51,54" fill="none" stroke="#1F5FD6" strokeWidth={4} />
          <polygon points="65,62 79,38 51,38" fill="none" stroke="#1F5FD6" strokeWidth={4} />
        </g>
      </g>
    );
  }
  if (item === "suitcase") {
    return (
      <g>
        <path d="M -14 10 Q 0 -6 14 10" fill="none" stroke="#2A2A2A" strokeWidth={6} />
        <rect x={-38} y={8} width={76} height={60} rx={10} fill={theme.accent} />
        <rect x={-38} y={30} width={76} height={6} fill="#0003" />
      </g>
    );
  }
  return null;
};

const Arm: React.FC<{ sx: number; ua: number; fa: number; shirt: string; skin: string; item?: PersonProps["item"]; text?: string; color?: string; t: number; seed: number }> = ({ sx, ua, fa, shirt, skin, item, text, color, t, seed }) => (
  <g transform={`translate(${sx},108) rotate(${ua})`}>
    <line x1={0} y1={0} x2={0} y2={UA} stroke={shirt} strokeWidth={24} strokeLinecap="round" />
    <g transform={`translate(0,${UA}) rotate(${fa})`}>
      <line x1={0} y1={0} x2={0} y2={FA} stroke={shirt} strokeWidth={21} strokeLinecap="round" />
      <circle cx={0} cy={FA + 6} r={13} fill={skin} />
      {item && item !== "none" ? (
        <g transform={`translate(0,${FA + 6}) rotate(${-(ua + fa)})`}>
          <HandItem item={item} text={text} color={color} t={t} seed={seed} />
        </g>
      ) : null}
    </g>
  </g>
);

const Leg: React.FC<{ hx: number; th: number; sh: number; pants: string; shoeDir: number }> = ({ hx, th, sh, pants, shoeDir }) => (
  <g transform={`translate(${hx},212) rotate(${th})`}>
    <line x1={0} y1={0} x2={0} y2={TH} stroke={pants} strokeWidth={28} strokeLinecap="round" />
    <g transform={`translate(0,${TH}) rotate(${sh})`}>
      <line x1={0} y1={0} x2={0} y2={SH} stroke={pants} strokeWidth={25} strokeLinecap="round" />
      <ellipse cx={shoeDir * 8} cy={SH + 8} rx={20} ry={10} fill="#1E1E24" />
    </g>
  </g>
);

export const Person: React.FC<PersonProps> = ({
  pose,
  x,
  y,
  scale = 1,
  shirt = theme.support,
  pants = "#2B3550",
  skin = theme.skin,
  hair = "#3A2A20",
  talk = 0,
  mood = "smile",
  item = "none",
  signText,
  signColor,
  backpack = false,
  helmet = false,
  seed = 0,
  flip = false,
}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const a = poseAngles(pose, t, seed);
  // blink every ~3-5 s for 3 frames
  const period = 105 + Math.round((seed * 37) % 45);
  const blink = (frame + Math.round(seed * 13)) % period < 3 ? 0.1 : 1;
  const mouthOpen = Math.max(0, Math.min(1, talk));

  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -scale : scale},${scale}) translate(0,-372)`}>
      {/* soft shadow */}
      <ellipse cx={0} cy={374} rx={62 - a.bob * 0.8} ry={11} fill="#000" opacity={0.28} />
      <g transform={`translate(0,${-a.bob})`}>
        <Leg hx={-19} th={a.thL} sh={a.shL} pants={pants} shoeDir={-1} />
        <Leg hx={19} th={a.thR} sh={a.shR} pants={pants} shoeDir={1} />
        <g transform={`rotate(${a.lean},0,212)`}>
          {backpack ? (
            <g>
              <rect x={-62} y={78} width={124} height={170} rx={28} fill={theme.oliveDark} />
              <rect x={-54} y={58} width={108} height={36} rx={18} fill="#2F3720" />
            </g>
          ) : null}
          {/* torso */}
          <rect x={-42} y={96} width={84} height={130} rx={32} fill={shirt} />
          <rect x={-42} y={190} width={84} height={30} rx={12} fill={pants} opacity={0.9} />
          {backpack ? (
            <g stroke="#2F3720" strokeWidth={9} strokeLinecap="round">
              <line x1={-26} y1={100} x2={-22} y2={190} />
              <line x1={26} y1={100} x2={22} y2={190} />
            </g>
          ) : null}
          {/* neck + head */}
          <rect x={-10} y={82} width={20} height={20} fill={skin} />
          <g transform={`rotate(${a.head},0,92)`}>
            <circle cx={0} cy={50} r={42} fill={skin} />
            {helmet ? (
              <path d="M -46 46 Q -44 2 0 0 Q 44 2 46 46 Z" fill={theme.olive} />
            ) : (
              <path d="M -42 44 Q -44 6 -6 6 Q 30 2 42 30 Q 44 40 42 46 Q 30 24 -6 26 Q -30 28 -42 44 Z" fill={hair} />
            )}
            <g transform={`translate(0,54) scale(1,${blink}) translate(0,-54)`}>
              <circle cx={-14} cy={54} r={5} fill="#1B1B22" />
              <circle cx={14} cy={54} r={5} fill="#1B1B22" />
            </g>
            <circle cx={-24} cy={66} r={6} fill="#E88" opacity={0.35} />
            <circle cx={24} cy={66} r={6} fill="#E88" opacity={0.35} />
            {mouthOpen > 0.05 ? (
              <ellipse cx={0} cy={72} rx={10} ry={2 + mouthOpen * 9} fill="#5A1E22" />
            ) : mood === "smile" ? (
              <path d="M -12 68 Q 0 80 12 68" fill="none" stroke="#5A1E22" strokeWidth={4} strokeLinecap="round" />
            ) : mood === "sad" ? (
              <path d="M -11 76 Q 0 68 11 76" fill="none" stroke="#5A1E22" strokeWidth={4} strokeLinecap="round" />
            ) : (
              <line x1={-9} y1={73} x2={9} y2={73} stroke="#5A1E22" strokeWidth={4} strokeLinecap="round" />
            )}
            {pose === "tired" ? <path d="M 34 30 q 6 10 0 14 q -6 -4 0 -14 z" fill="#8FD3FF" /> : null}
          </g>
          {/* arms */}
          <Arm sx={-44} ua={a.uaL} fa={a.faL} shirt={shirt} skin={skin} t={t} seed={seed} />
          <Arm sx={44} ua={a.uaR} fa={a.faR} shirt={shirt} skin={skin} item={item} text={signText} color={signColor} t={t} seed={seed} />
        </g>
      </g>
    </g>
  );
};
