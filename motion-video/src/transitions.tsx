import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import type { TransitionPresentation, TransitionPresentationComponentProps } from "@remotion/transitions";

type P = Record<string, never>;

const Zoom: React.FC<TransitionPresentationComponentProps<P>> = ({ children, presentationDirection, presentationProgress }) => {
  const p = presentationProgress;
  const entering = presentationDirection === "entering";
  const scale = entering ? interpolate(p, [0, 1], [0.55, 1]) : interpolate(p, [0, 1], [1, 2.4]);
  const opacity = entering ? interpolate(p, [0, 0.6], [0, 1], { extrapolateRight: "clamp" }) : interpolate(p, [0.3, 1], [1, 0], { extrapolateLeft: "clamp" });
  return (
    <AbsoluteFill style={{ transform: `scale(${scale})`, opacity, filter: `blur(${entering ? (1 - p) * 8 : p * 10}px)` }}>
      {children}
    </AbsoluteFill>
  );
};

/** Custom zoom-through transition. */
export const zoomThrough = (): TransitionPresentation<P> => ({ component: Zoom, props: {} as P });
