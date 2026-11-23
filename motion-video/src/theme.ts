import { continueRender, delayRender, staticFile } from "remotion";

// Heebo bundled locally (public/fonts) so rendering needs no network.
export const FONT = "Heebo";
const HEBREW = "U+0590-05FF, U+200C-2010, U+20AA, U+25CC, U+FB1D-FB4F";
if (typeof document !== "undefined") {
  const handle = delayRender("Loading Heebo");
  const faces: FontFace[] = [];
  for (const w of ["400", "700", "800", "900"]) {
    faces.push(new FontFace(FONT, `url(${staticFile(`fonts/heebo-hebrew-${w}-normal.woff2`)}) format("woff2")`, { weight: w, unicodeRange: HEBREW }));
    faces.push(new FontFace(FONT, `url(${staticFile(`fonts/heebo-latin-${w}-normal.woff2`)}) format("woff2")`, { weight: w }));
  }
  Promise.all(faces.map((f) => f.load().then(() => document.fonts.add(f))))
    .then(() => continueRender(handle))
    .catch((e) => {
      console.error(e);
      continueRender(handle);
    });
}
export const W = 1080;
export const H = 1920;
export const FPS = 30;
// Safe margins: 6% on every side
export const SAFE_X = Math.round(W * 0.06);
export const SAFE_Y = Math.round(H * 0.06);

export const theme = {
  // dominant
  bg1: "#0D1828",
  bg2: "#18304F",
  // support
  support: "#3A7BFF",
  supportSoft: "#9DBBFF",
  // accent
  accent: "#FF5A3C",
  text: "#F5F7FA",
  muted: "#A9B8CC",
  dark: "#070A10",
  yellow: "#F7C948",
  skin: "#F1C39E",
  skin2: "#D9A27A",
  olive: "#5C6B3C",
  oliveDark: "#3F4A28",
  paper: "#F4F1EA",
};
