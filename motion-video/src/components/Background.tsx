import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { theme } from "../theme";

type Variant = "normal" | "dark" | "warm" | "cool";

const palettes: Record<Variant, { a: string; b: string; s1: string; s2: string; s3: string }> = {
  normal: { a: theme.bg1, b: theme.bg2, s1: theme.support, s2: theme.accent, s3: theme.supportSoft },
  dark: { a: "#050608", b: "#16090B", s1: "#5A1A1A", s2: "#2A0E0E", s3: "#3B2A12" },
  warm: { a: "#1A1422", b: "#3A1F2A", s1: theme.accent, s2: theme.yellow, s3: theme.support },
  cool: { a: "#0B1A22", b: "#123345", s1: "#2BB3C0", s2: theme.support, s3: theme.yellow },
};

export const Background: React.FC<{ variant?: Variant }> = ({ variant = "normal" }) => {
  const f = useCurrentFrame();
  const p = palettes[variant];
  const t = f / 30;
  const shapes = [
    { c: p.s1, size: 620, x: 120 + Math.sin(t * 0.35) * 60, y: 260 + Math.cos(t * 0.3) * 50, o: 0.22 },
    { c: p.s2, size: 520, x: 760 + Math.cos(t * 0.28) * 70, y: 1180 + Math.sin(t * 0.33) * 60, o: 0.16 },
    { c: p.s3, size: 300, x: 820 + Math.sin(t * 0.4 + 1) * 50, y: 520 + Math.cos(t * 0.37) * 70, o: 0.12 },
  ];
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${160 + Math.sin(t * 0.2) * 10}deg, ${p.a} 0%, ${p.b} 100%)`,
        overflow: "hidden",
      }}
    >
      {shapes.map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: s.x - s.size / 2,
            top: s.y - s.size / 2,
            width: s.size,
            height: s.size,
            borderRadius: "50%",
            background: s.c,
            opacity: s.o,
            filter: "blur(90px)",
          }}
        />
      ))}
      {/* subtle grain-like vignette */}
      <AbsoluteFill
        style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)" }}
      />
    </AbsoluteFill>
  );
};
