/**
 * ============================================================
 *  metron1x — ALL personal content lives in this one file.
 * ============================================================
 *
 *  Rules the site follows automatically:
 *  - Any value that is "TODO", "" (empty), or contains "TODO" is HIDDEN.
 *  - Fields commented `0 = unknown` are hidden while they are 0.
 *  - If a whole settings tab has no real values, the tab is hidden.
 *  - eDPI is computed from dpi × sensitivity — never type it in.
 *  - Videos with a placeholder / invalid ID are hidden; if none are
 *    valid, the whole Videos section disappears.
 *
 *  Edit, save, and the dev server reloads instantly.
 */
import type { Profile } from "../lib/types";

export const profile: Profile = {
  handle: "metron1x",
  displayName: "♕ metron1x™",
  badge: "Ancient Artifact",
  tagline: "CS veteran since 2002",
  role: "Full-time developer · Part-time gamer",
  // One line per paragraph. Keep it short.
  bio: [
    "By day I write code for a living: cloud platforms, microservices and AI tools, from Java and TypeScript to local LLMs.",
    "By night I'm in Counter-Strike, like I have been since 2002. Skipped CS2's launch, came back out of boredom, and still top the scoreboard half-asleep on 800 DPI.",
  ],
  avatar: "https://avatars.fastly.steamstatic.com/77df7851b64f84e1639cadab4db4a72ac8996b62_full.jpg",
  steamId64: "76561197961132406",

  stats: {
    cs2Hours: 3583, // update occasionally; shown rounded down, e.g. "3,500+"
    steamLevel: 56,
    playingSince: 2002,
    apexHours: 1517, // optional: "also played"
  },

  links: {
    steam: "https://steamcommunity.com/id/metronix9/",
    csstats: "https://csstats.gg/player/76561197961132406",
    youtube: "https://youtube.com/@TODO",
    // optional — add any of these and a link card appears:
    // faceit: "https://www.faceit.com/en/players/...",
    // leetify: "https://leetify.com/app/profile/...",
    // twitch: "https://twitch.tv/...",
    // x: "https://x.com/...",
    // discord: "https://discord.gg/...",
  },

  mouse: {
    dpi: 1000,
    sensitivity: 0.88, // in-game sensitivity → eDPI 880 is calculated automatically
    pollingRate: 2000, // Hz
    zoomSensitivity: 1.0, // not shown on the site; used in the generated autoexec.cfg
  },

  // From autoexec.cfg (cl_crosshair* commands)
  crosshair: {
    code: "CSR8x92joO3YdMa7wWtNTY4BhtYhCZdOD6iCYZiCHDWKUU",
    style: 4, // cl_crosshairstyle 4 (Classic Static)
    length: 5, // cl_crosshair_length 5
    thickness: 2, // cl_crosshair_thickness 2
    gap: 2, // cl_crosshair_gap 1
    outline: false, // cl_crosshair_drawoutline 0
    dot: false, // cl_crosshairdot 0
    color: "#00FF00", // cl_crosshaircolor_r/g/b 0 255 0
    alpha: 255, // cl_crosshaircolor_a 255
    tStyle: false, // cl_crosshair_t 0
    followRecoil: false, // cl_crosshair_recoil 0
    sniperWidth: 3, // cl_crosshair_sniper_width 3
  },

  // TODO — these are unconfirmed. The whole tab stays hidden while
  // `todo: true` is set. Fix the numbers, then delete that line.
  viewmodel: { fov: 68, offsetX: 2.5, offsetY: 0, offsetZ: -1.5, presetPos: 3, todo: true },

  // Most of the Video tab is read from src/data/cs2_video.txt — copy your
  // Steam/userdata/<id>/730/local/cfg/cs2_video.txt over it to update.
  // These Video-menu settings aren't stored in that file:
  video: {
    brightness: "93%", // in-game Brightness %, e.g. "93%"
    boostPlayerContrast: true,
    scalingMode: "Stretched", // GPU driver setting, e.g. "Stretched" / "Black bars"
    maxFps: 0, // fps_max from autoexec — 0 = unlimited
  },

  launchOptions: "-fullscreen +exec autoexec.cfg -allow_third_party_software",

  binds: [{ action: "Jump throw", key: "TODO" }],

  gear: [
    { category: "Mouse", name: "MCHOSE L7 Ultra" },
    { category: "Keyboard", name: "Xinmeng X URX Zero68", note: "Hall Effect" },
    { category: "Mousepad", name: "Xraypad Unique Heavy Bee Esports Mousepad - SOFT", note: "Control-Type" },
    { category: "Headset", name: "HyperX Cloud Earbuds III" },
    { category: "Monitor", name: "Kreo Obsidian 27in 200Hz 2K 1440p QHD Gaming IPS Monitor", note: "200Hz" },
  ],

  pc: [
    { part: "CPU", name: "AMD Ryzen 7 5800X3D" },
    { part: "GPU", name: "NVIDIA RTX 3060 Ti" },
    { part: "RAM", name: "32GB" },
  ],

  // Paste the 11-character ID from a YouTube URL:
  // https://www.youtube.com/watch?v=dQw4w9WgXcQ  →  id: "dQw4w9WgXcQ"
  videos: [{ id: "YOUTUBE_VIDEO_ID", title: "TODO", description: "" }],
};
