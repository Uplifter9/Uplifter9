"""Generate narration mp3 + word timings for each scene in script.json."""
import asyncio, json, os, re, subprocess, sys
import edge_tts

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROXY = os.environ.get("HTTPS_PROXY")

async def gen(scene, voice):
    sid = scene["id"]
    mp3 = os.path.join(ROOT, "public/vo", f"{sid}.mp3")
    words = []
    com = edge_tts.Communicate(scene["narration"], voice, rate="+6%", boundary="WordBoundary", proxy=PROXY)
    sub = edge_tts.SubMaker()
    with open(mp3, "wb") as f:
        async for chunk in com.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                sub.feed(chunk)
                words.append({"text": re.sub("[\u0591-\u05C7]", "", chunk["text"]), "startMs": chunk["offset"] / 1e4,
                              "endMs": (chunk["offset"] + chunk["duration"]) / 1e4})
    with open(mp3[:-4] + ".vtt", "w", encoding="utf-8") as f:
        f.write(sub.get_srt())
    dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                         "-of", "csv=p=0", mp3]).decode().strip())
    return {"id": sid, "durationSec": dur, "words": words, "onScreenText": scene["onScreenText"]}

async def main():
    s = json.load(open(os.path.join(ROOT, "script.json"), encoding="utf-8"))
    out = []
    for sc in s["scenes"]:
        out.append(await gen(sc, s["voice"]))
        print(sc["id"], round(out[-1]["durationSec"], 2), len(out[-1]["words"]))
    json.dump(out, open(os.path.join(ROOT, "src/vo.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)

asyncio.run(main())
