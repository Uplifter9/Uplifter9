import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import type { TransitionPresentation } from "@remotion/transitions";
import voData from "./vo.json";
import type { SceneProps, Vo } from "./types";
import { FPS } from "./theme";
import { zoomThrough } from "./transitions";
import { S1Intro } from "./scenes/S1Intro";
import { S2Judicial } from "./scenes/S2Judicial";
import { S3Oct7 } from "./scenes/S3Oct7";
import { S4Hostages } from "./scenes/S4Hostages";
import { S5North } from "./scenes/S5North";
import { S6Economy } from "./scenes/S6Economy";
import { S7Draft } from "./scenes/S7Draft";
import { S8Inquiry } from "./scenes/S8Inquiry";
import { S9Outro } from "./scenes/S9Outro";

const vo = voData as Vo[];
// chronological order (matches script.json)
const SCENES: React.FC<SceneProps>[] = [S1Intro, S2Judicial, S3Oct7, S5North, S6Economy, S4Hostages, S7Draft, S8Inquiry, S9Outro];

// Varied transitions, never the same type twice in a row (12-18 frames).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TRANSITIONS: { p: TransitionPresentation<any>; T: number }[] = [
  { p: slide({ direction: "from-left" }), T: 15 },
  { p: fade(), T: 18 },
  { p: wipe({ direction: "from-right" }), T: 16 },
  { p: zoomThrough(), T: 16 },
  { p: slide({ direction: "from-bottom" }), T: 14 },
  { p: wipe({ direction: "from-top-left" }), T: 15 },
  { p: zoomThrough(), T: 16 },
  { p: fade(), T: 18 },
];

const HOLD_END = 30;

// scene length = speech length + 0.4 s, plus the following transition overlap
export const SCENE_DURS = vo.map((v, i) => {
  const lastWord = v.words.length ? v.words[v.words.length - 1].endMs / 1000 : v.durationSec;
  const base = Math.ceil((lastWord + 0.4) * FPS);
  return i < vo.length - 1 ? base + TRANSITIONS[i].T : base + HOLD_END;
});

export const TOTAL_FRAMES = SCENE_DURS.reduce((a, b) => a + b, 0) - TRANSITIONS.reduce((a, b) => a + b.T, 0);

const transitionStarts = (() => {
  const out: number[] = [];
  let start = 0;
  for (let i = 0; i < SCENE_DURS.length - 1; i++) {
    start += SCENE_DURS[i] - TRANSITIONS[i].T;
    out.push(start);
  }
  return out;
})();

export const Main: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0D1828" }}>
      <TransitionSeries>
        {SCENES.flatMap((Scene, i) => {
          const dur = SCENE_DURS[i];
          const T = i < TRANSITIONS.length ? TRANSITIONS[i].T : HOLD_END;
          const items = [
            <TransitionSeries.Sequence key={`s${i}`} durationInFrames={dur}>
              <Scene vo={vo[i]} dur={dur} exitAt={dur - T} />
            </TransitionSeries.Sequence>,
          ];
          if (i < TRANSITIONS.length) {
            items.push(
              <TransitionSeries.Transition
                key={`t${i}`}
                presentation={TRANSITIONS[i].p}
                timing={springTiming({ config: { damping: 200 }, durationInFrames: TRANSITIONS[i].T })}
              />,
            );
          }
          return items;
        })}
      </TransitionSeries>
      {transitionStarts.map((f, i) => (
        <Sequence key={i} from={Math.max(0, f - 4)} durationInFrames={30}>
          <Audio src={staticFile("sfx/whoosh.wav")} volume={0.22} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
