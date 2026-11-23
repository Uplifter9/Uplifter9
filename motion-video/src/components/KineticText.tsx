import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { springAt } from "../anim";
import { FONT, theme } from "../theme";

/** Words pop in one by one (scale 0.6->1, opacity 0->1). Accent words in accent colour. */
export const KineticText: React.FC<{
  text: string;
  accent?: string[];
  size?: number;
  delay?: number;
  top?: number;
  color?: string;
  accentColor?: string;
}> = ({ text, accent = [], size = 88, delay = 4, top = 190, color = theme.text, accentColor = theme.accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 80,
        right: 80,
        direction: "rtl",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        columnGap: size * 0.28,
        rowGap: size * 0.05,
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1.12,
        textAlign: "center",
      }}
    >
      {words.map((w, i) => {
        const p = springAt(frame, fps, delay + i * 5, 13);
        const isAccent = accent.some((a) => w.includes(a));
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              color: isAccent ? accentColor : color,
              opacity: Math.min(1, p * 1.5),
              transform: `translateY(${(1 - p) * 40}px) scale(${0.6 + 0.4 * p})`,
              textShadow: "0 6px 24px rgba(0,0,0,0.45)",
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};
