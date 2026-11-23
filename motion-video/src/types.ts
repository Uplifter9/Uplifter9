export type Word = { text: string; startMs: number; endMs: number };
export type Vo = { id: string; durationSec: number; words: Word[]; onScreenText: string };
export type SceneProps = { vo: Vo; dur: number; exitAt: number };
