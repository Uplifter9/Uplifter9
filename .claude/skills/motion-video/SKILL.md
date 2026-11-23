---
name: motion-video
description: Create polished, high-energy explainer videos in code (Remotion + React): animated SVG characters with moving limbs, infographics, kinetic typography, transitions and fades, Hebrew or English narration, burned-in subtitles, MP4 export. Use whenever the user asks for a video, animation, explainer, promo or reel.
---

# Motion video skill

## Stack
- Remotion (React) for composition and rendering. Init once: `npx create-video@latest --blank` then `npm i @remotion/transitions @remotion/captions @remotion/google-fonts`.
- Narration: `pip install edge-tts`. Hebrew voices: he-IL-AvriNeural (male), he-IL-HilaNeural (female). English: en-US-AndrewNeural.
- ffmpeg for audio probing and final checks.
- Output: 1080x1920 (reels) or 1920x1080 (landscape), 30fps, H.264 MP4 in `out/`.

## Workflow (always in this order)
1. Script: write a scene list in `script.json`: for each scene an id, the narration text, the visual idea, and the on-screen text (max 6 words). Show it to the user and wait for approval before building.
2. Voice: for each scene run `edge-tts --voice <voice> --text "..." --write-media public/vo/<id>.mp3 --write-subtitles public/vo/<id>.vtt`. Measure each file with ffprobe; scene length = audio length + 0.4s.
3. Captions: convert the VTT files into Remotion caption objects (word-level timing). Show 1-2 lines at a time, bottom third, white text with a soft dark stroke, active word highlighted in the accent colour. Hebrew: direction rtl, font Heebo or Assistant.
4. Build scenes as React components under `src/scenes/`, one per scene, joined with `TransitionSeries`.
5. Render a low-res preview first (`--scale=0.5`), extract 4 stills with `npx remotion still` and check them visually; fix overlaps, cut-off text and empty frames. Then render final: `npx remotion render Main out/video.mp4 --codec=h264 --crf=18`.

## Motion rules (what makes it look professional)
- Nothing is ever static: every element enters with a spring (`spring({frame, fps, config:{damping:14}})`), holds with a slow drift or breathing scale (1.00 to 1.03), and exits before the cut.
- Stagger: elements in one scene enter 4 to 6 frames apart, never all together.
- Easing: use springs or `Easing.bezier(0.16,1,0.3,1)`. Never linear motion except for continuous loops.
- Transitions between scenes (vary them, 12 to 18 frames): `fade()`, `slide({direction})`, `wipe()`, and a custom zoom-through. Never the same transition twice in a row.
- Camera: wrap each scene in a container that pushes in slowly (scale 1 to 1.06 over the scene) for depth.
- Palette: one dominant, one support, one accent; set in `src/theme.ts` and used everywhere. Background never flat: subtle gradient plus 2-3 slowly floating shapes.
- Typography: kinetic text, words pop in one by one (scale 0.6 to 1 with spring, opacity 0 to 1), key word in accent colour. Max 2 sizes per scene.

## Characters (moving arms and legs)
Build characters as rigged SVG in `src/characters/`:
- Separate `<g>` groups for head, torso, upper arm, forearm, thigh, shin, each with its own `transform-origin` at the joint (shoulder, elbow, hip, knee).
- Animate joints with sine-based cycles: walk = thighs rotate +/-25deg in opposite phase, shins follow with 0.25 cycle delay; wave = upper arm -120deg, forearm oscillates +/-20deg at 3Hz; talk = head bob 2deg and mouth path morph synced to narration volume (use `@remotion/media-utils` visualizeAudio).
- Blink every 3 to 5 seconds (eye scaleY to 0.1 for 3 frames).
- Style: flat vector, rounded limbs, 2-3 colours from the theme, soft shadow ellipse under the feet.
- Provide poses as props: `pose="wave" | "walk" | "point" | "think" | "celebrate"`.

## Infographics
- Numbers count up (`interpolate` with easing, rounded with `Math.round`).
- Bar and line charts draw in (bars grow from 0, lines via `strokeDashoffset`).
- Icons and arrows draw with stroke animation; connector lines appear after both nodes.
- One idea per scene; the chart is the hero, labels sit outside the shapes.

## Audio
- Narration at 0 dB; background music (royalty-free, user-supplied or none) ducked to about -18 dB under speech; short whoosh sound effect on each transition at low volume.

## Quality checklist before delivering
- Text never cut off or overlapping a character; safe margins 6% on every side.
- Hebrew text renders right to left and punctuation is correct.
- Captions match the audio within 0.1s.
- Every scene has motion in every frame; no transition repeats twice in a row.
- Deliver `out/video.mp4` plus `script.json`, and say the length and resolution.
