import React from "react";
import { useCurrentFrame } from "remotion";
import { ease, springAt } from "../anim";
import { FONT, theme } from "../theme";

/** Number that counts up with easing, plus a label. Absolute-positioned around (x, y) center. */
export const Counter: React.FC<{
  to: number;
  from?: number;
  start: number;
  length?: number;
  x: number;
  y: number;
  size?: number;
  label?: string;
  prefix?: string;
  suffix?: string;
  color?: string;
  labelColor?: string;
}> = ({ to, from = 0, start, length = 40, x, y, size = 150, label, prefix = "", suffix = "", color = theme.text, labelColor = theme.muted }) => {
  const frame = useCurrentFrame();
  const p = springAt(frame, 30, start, 14);
  const v = Math.round(ease(frame, start, start + length, from, to));
  const breath = 1 + 0.012 * Math.sin(frame / 12);
  return (
    <div
      style={{
        position: "absolute",
        left: x - 400,
        width: 800,
        top: y - size * 0.6,
        textAlign: "center",
        fontFamily: FONT,
        opacity: Math.min(1, p * 1.5),
        transform: `scale(${(0.6 + 0.4 * p) * breath})`,
      }}
    >
      <div style={{ fontSize: size, fontWeight: 900, color, lineHeight: 1, direction: "ltr", textShadow: "0 8px 30px rgba(0,0,0,0.5)" }}>
        {prefix}
        {v.toLocaleString("en-US")}
        {suffix}
      </div>
      {label ? (
        <div style={{ fontSize: size * 0.32, fontWeight: 700, color: labelColor, marginTop: 10, direction: "rtl" }}>{label}</div>
      ) : null}
    </div>
  );
};
