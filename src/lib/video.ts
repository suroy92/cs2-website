/**
 * CS2 video settings — read straight from src/data/cs2_video.txt
 * (a copy of Steam/userdata/<id>/730/local/cfg/cs2_video.txt) and
 * translated into the names and option labels shown in CS2's
 * Settings → Video menu, in the same order as the menu.
 *
 * To update: copy your current cs2_video.txt over src/data/cs2_video.txt.
 * Values the table doesn't recognise are hidden (and logged at build time)
 * rather than shown as raw numbers.
 */
import raw from "../data/cs2_video.txt?raw";

/** Minimal parser for Valve KeyValues: lines of  "key"  "value". */
export function parseKeyValues(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of text.matchAll(/^\s*"([^"]+)"\s+"([^"]*)"\s*$/gm)) out[m[1]] = m[2];
  return out;
}

export const videoCfg = parseKeyValues(raw);

type Cfg = Record<string, string>;
const v = (cfg: Cfg, key: string) => cfg[`setting.${key}`];

/** Look a raw value up in an options table; warn and hide if it's unknown. */
function pick(cfg: Cfg, key: string, options: Record<string, string>): string | undefined {
  const val = v(cfg, key);
  if (val === undefined) return undefined;
  if (val in options) return options[val];
  console.warn(`[video] Unknown value "${val}" for setting.${key} — row hidden. Add it to src/lib/video.ts.`);
  return undefined;
}

export interface VideoSetting {
  /** in-game label */
  label: string;
  /** menu group, as in CS2 */
  group: "Display" | "Advanced Video";
  read: (cfg: Cfg) => string | undefined;
}

/**
 * In-game order. Rows whose `read` returns undefined are hidden.
 * (Brightness and Boost Player Contrast aren't stored in cs2_video.txt —
 * they come from profile.ts and are merged in by lib/content.ts.)
 */
export const VIDEO_SETTINGS: VideoSetting[] = [
  // ---------- Display ----------
  {
    label: "Display Mode",
    group: "Display",
    read: (c) => {
      const fs = v(c, "fullscreen");
      if (fs === undefined) return undefined;
      if (fs === "1") return "Fullscreen";
      return v(c, "nowindowborder") === "1" ? "Fullscreen Windowed" : "Windowed";
    },
  },
  {
    label: "Aspect Ratio",
    group: "Display",
    read: (c) => pick(c, "aspectratiomode", { "0": "Normal 4:3", "1": "Widescreen 16:9", "2": "Widescreen 16:10" }),
  },
  {
    label: "Resolution",
    group: "Display",
    read: (c) => {
      const w = v(c, "defaultres");
      const h = v(c, "defaultresheight");
      return w && h ? `${w}x${h}` : undefined;
    },
  },
  {
    label: "Refresh Rate",
    group: "Display",
    read: (c) => {
      const n = Number(v(c, "refreshrate_numerator"));
      const d = Number(v(c, "refreshrate_denominator") ?? 1);
      return n > 0 && d > 0 ? `${Math.round(n / d)}Hz` : undefined;
    },
  },

  // ---------- Advanced Video ----------
  {
    label: "Wait for Vertical Sync",
    group: "Advanced Video",
    read: (c) => pick(c, "mat_vsync", { "0": "Disabled", "1": "Enabled" }),
  },
  {
    label: "Multisampling Anti-Aliasing Mode",
    group: "Advanced Video",
    read: (c) => {
      const s = v(c, "msaa_samples");
      if (s === undefined) return undefined;
      if (s === "0") return v(c, "r_csgo_cmaa_enable") === "1" ? "CMAA2" : "None";
      return pick(c, "msaa_samples", { "2": "2X MSAA", "4": "4X MSAA", "8": "8X MSAA" });
    },
  },
  {
    label: "Global Shadow Quality",
    group: "Advanced Video",
    read: (c) => pick(c, "videocfg_shadow_quality", { "0": "Low", "1": "Medium", "2": "High", "3": "Very High" }),
  },
  {
    label: "Dynamic Shadows",
    group: "Advanced Video",
    read: (c) => pick(c, "videocfg_dynamic_shadows", { "0": "Sun Only", "1": "All" }),
  },
  {
    label: "Model / Texture Detail",
    group: "Advanced Video",
    read: (c) => pick(c, "videocfg_texture_detail", { "0": "Low", "1": "Medium", "2": "High" }),
  },
  {
    label: "Texture Filtering Mode",
    group: "Advanced Video",
    read: (c) =>
      pick(c, "r_texturefilteringquality", {
        "0": "Bilinear",
        "1": "Trilinear",
        "2": "Anisotropic 2X",
        "3": "Anisotropic 4X",
        "4": "Anisotropic 8X",
        "5": "Anisotropic 16X",
      }),
  },
  {
    label: "Shader Detail",
    group: "Advanced Video",
    read: (c) => pick(c, "shaderquality", { "0": "Low", "1": "High" }),
  },
  {
    label: "Particle Detail",
    group: "Advanced Video",
    read: (c) => pick(c, "videocfg_particle_detail", { "0": "Low", "1": "Medium", "2": "High", "3": "Very High" }),
  },
  {
    label: "Ambient Occlusion",
    group: "Advanced Video",
    read: (c) => pick(c, "videocfg_ao_detail", { "0": "Disabled", "1": "Medium", "2": "High" }),
  },
  {
    label: "High Dynamic Range",
    group: "Advanced Video",
    read: (c) => pick(c, "videocfg_hdr_detail", { "3": "Performance", "-1": "Quality" }),
  },
  {
    label: "FidelityFX Super Resolution",
    group: "Advanced Video",
    read: (c) =>
      pick(c, "videocfg_fsr_detail", {
        "0": "Disabled (Highest Quality)",
        "1": "Ultra Quality",
        "2": "Quality",
        "3": "Balanced",
        "4": "Performance",
      }),
  },
  {
    label: "NVIDIA Reflex Low Latency",
    group: "Advanced Video",
    read: (c) => pick(c, "r_low_latency", { "0": "Disabled", "1": "Enabled", "2": "Enabled + Boost" }),
  },
];
