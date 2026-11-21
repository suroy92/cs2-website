/**
 * npm run sync-cfg
 *
 * Copies your live CS2 config files into the project, so the website shows
 * exactly what you're using:
 *   autoexec.cfg   → src/data/autoexec.cfg   (served by "Download autoexec.cfg")
 *   cs2_video.txt  → src/data/cs2_video.txt  (the Video settings tab)
 *
 * Run it on your own PC after changing settings in-game, then commit & push.
 * (It is NOT part of the build — hosts like Vercel don't have your Steam folders.)
 *
 * Paths default to this PC's Steam folders. Override them if they move:
 *   CS2_AUTOEXEC="D:\...\autoexec.cfg"  CS2_VIDEO_CFG="C:\...\cs2_video.txt"  npm run sync-cfg
 */
import { copyFileSync, existsSync, readFileSync } from "node:fs";

const FILES = [
  {
    name: "autoexec.cfg",
    from: process.env.CS2_AUTOEXEC || "E:/SteamLibrary/steamapps/common/Counter-Strike Global Offensive/game/csgo/cfg/autoexec.cfg",
    to: "src/data/autoexec.cfg",
  },
  {
    name: "cs2_video.txt",
    from: process.env.CS2_VIDEO_CFG || "C:/Program Files (x86)/Steam/userdata/1213085133/730/local/cfg/cs2_video.txt",
    to: "src/data/cs2_video.txt",
  },
];

let failed = false;
for (const f of FILES) {
  if (!existsSync(f.from)) {
    console.warn(`✗ ${f.name}: not found at ${f.from}`);
    failed = true;
    continue;
  }
  const same = existsSync(f.to) && readFileSync(f.to).equals(readFileSync(f.from));
  if (same) {
    console.log(`= ${f.name}: already up to date`);
  } else {
    copyFileSync(f.from, f.to);
    console.log(`✓ ${f.name}: updated → ${f.to}`);
  }
}
if (failed) {
  console.warn("\nSet CS2_AUTOEXEC / CS2_VIDEO_CFG to the right paths and run again.");
  process.exitCode = 1;
}
