import { useAudioData, visualizeAudio } from "@remotion/media-utils";
import { staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { Vo } from "./types";

/** Mouth opening 0..1 from narration volume, gated to word timings. */
export const useTalk = (vo: Vo) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const audio = useAudioData(staticFile(`vo/${vo.id}.mp3`));
  const ms = (frame / fps) * 1000;
  const inWord = vo.words.some((w) => ms >= w.startMs && ms <= w.endMs);
  if (!audio || !inWord) return 0;
  const v = visualizeAudio({ fps, frame, audioData: audio, numberOfSamples: 32 });
  const low = v.slice(0, 8).reduce((a, b) => a + b, 0) / 8;
  return Math.min(1, low * 7);
};
