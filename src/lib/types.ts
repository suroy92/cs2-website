/** Shape of src/data/profile.ts. Optional fields can simply be omitted. */

export type LinkKey = "steam" | "csstats" | "youtube" | "faceit" | "leetify" | "twitch" | "x" | "discord";

export interface Profile {
  handle: string;
  displayName: string;
  badge?: string;
  tagline: string;
  /** short line under the name, e.g. "Full-time developer · Part-time gamer" */
  role?: string;
  /** one string per paragraph */
  bio: string | string[];
  avatar: string;
  steamId64?: string;
  stats: { cs2Hours: number; steamLevel?: number; playingSince: number; apexHours?: number };
  links: Partial<Record<LinkKey, string>>;
  mouse: {
    dpi: number;
    sensitivity: number;
    zoomSensitivity?: number;
    pollingRate?: number;
    todo?: string[];
  };
  crosshair: {
    code: string;
    style: number;
    length: number;
    thickness: number;
    gap: number;
    outline: boolean;
    outlineThickness?: number;
    dot: boolean;
    color: string;
    alpha: number;
    tStyle: boolean;
    followRecoil?: boolean;
    sniperWidth?: number;
  };
  viewmodel: {
    fov: number;
    offsetX: number;
    offsetY: number;
    offsetZ: number;
    presetPos?: number;
    todo?: boolean;
  };
  /** Everything else in the Video tab comes from src/data/cs2_video.txt (see lib/video.ts). */
  video: {
    brightness?: string;
    boostPlayerContrast?: boolean;
    scalingMode?: string;
    maxFps?: number;
  };
  launchOptions: string;
  binds: { action: string; key: string }[];
  gear: { category: string; name: string; note?: string }[];
  pc: { part: string; name: string }[];
  videos: { id: string; title: string; description?: string }[];
}
