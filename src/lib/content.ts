/**
 * Turns the raw profile into display-ready, already-filtered content.
 * Components only ever render what this module returns, so anything
 * unknown (TODO / empty / 0-means-unknown) never reaches the page.
 */
import { profile } from "../data/profile";
import type { LinkKey } from "./types";
import { VIDEO_SETTINGS, videoCfg } from "./video";

/* ---------- visibility helpers ---------- */

/** A string is "known" if it's non-empty and not a TODO placeholder. */
export const knownStr = (v: unknown): v is string =>
  typeof v === "string" && v.trim() !== "" && !/todo/i.test(v);

/** For numbers where 0 means "unknown". */
export const knownNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v) && v !== 0;

/** For numbers where 0 is a legitimate value (offsets, gap…). */
export const anyNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

export const knownBool = (v: unknown): v is boolean => typeof v === "boolean";

/* ---------- formatting ---------- */

const onOff = (b: boolean) => (b ? "On" : "Off");
const fmtNum = (n: number) => (Number.isInteger(n) ? String(n) : String(+n.toFixed(3)));

/** 3583 → "3,500+" (rounds down to the nearest 500 so it stays true between updates). */
export function hoursLabel(h: number): string {
  if (h < 500) return `${h}`;
  return `${(Math.floor(h / 500) * 500).toLocaleString("en-US")}+`;
}

export const eDPI: number | null =
  knownNum(profile.mouse.dpi) && knownNum(profile.mouse.sensitivity) && !profile.mouse.todo?.includes("sensitivity")
    ? Math.round(profile.mouse.dpi * profile.mouse.sensitivity * 100) / 100
    : null;

/* ---------- settings tabs ---------- */

export interface Row {
  label: string;
  value: string;
  /** "bool" renders as an On/Off pill */
  kind?: "bool";
  on?: boolean;
}

export interface Tab {
  id: string;
  label: string;
  rows: Row[];
  /** extra payload for special tabs */
  code?: string;
}

/** Build rows, skipping anything whose value is undefined (= unknown). */
function rows(list: Array<[string, string | boolean | undefined]>): Row[] {
  const out: Row[] = [];
  for (const [label, v] of list) {
    if (v === undefined) continue;
    if (typeof v === "boolean") out.push({ label, value: onOff(v), kind: "bool", on: v });
    else out.push({ label, value: v });
  }
  return out;
}

const m = profile.mouse;
const mTodo = new Set(m.todo ?? []);
const ok = <K extends keyof typeof m>(k: K) => !mTodo.has(k as string);

const mouseRows = rows([
  ["DPI", ok("dpi") && knownNum(m.dpi) ? fmtNum(m.dpi) : undefined],
  ["Sensitivity", ok("sensitivity") && knownNum(m.sensitivity) ? fmtNum(m.sensitivity) : undefined],
  ["Polling rate", ok("pollingRate") && knownNum(m.pollingRate) ? `${m.pollingRate} Hz` : undefined],
  ["eDPI", eDPI !== null ? fmtNum(eDPI) : undefined],
]);

const c = profile.crosshair;
export const crosshair = c;
export const crosshairCode: string | null = knownStr(c.code) ? c.code : null;
const crosshairRows = rows([
  ["Style", anyNum(c.style) ? fmtNum(c.style) : undefined],
  ["Length", anyNum(c.length) ? fmtNum(c.length) : undefined],
  ["Thickness", anyNum(c.thickness) ? fmtNum(c.thickness) : undefined],
  ["Gap", anyNum(c.gap) ? fmtNum(c.gap) : undefined],
  ["Outline", knownBool(c.outline) ? c.outline : undefined],
  ["Dot", knownBool(c.dot) ? c.dot : undefined],
  ["T-style", knownBool(c.tStyle) ? c.tStyle : undefined],
  ["Color", knownStr(c.color) ? c.color.toUpperCase() : undefined],
  ["Alpha", anyNum(c.alpha) ? fmtNum(c.alpha) : undefined],
  ["Follow recoil", knownBool(c.followRecoil) ? c.followRecoil : undefined],
  ["Sniper width", anyNum(c.sniperWidth) ? fmtNum(c.sniperWidth) : undefined],
]);

const vm = profile.viewmodel;
const viewmodelRows = vm.todo
  ? []
  : rows([
      ["FOV", anyNum(vm.fov) ? fmtNum(vm.fov) : undefined],
      ["Offset X", anyNum(vm.offsetX) ? fmtNum(vm.offsetX) : undefined],
      ["Offset Y", anyNum(vm.offsetY) ? fmtNum(vm.offsetY) : undefined],
      ["Offset Z", anyNum(vm.offsetZ) ? fmtNum(vm.offsetZ) : undefined],
      ["Preset position", anyNum(vm.presetPos) ? fmtNum(vm.presetPos) : undefined],
    ]);

/* Video — in-game names & option labels, in CS2's menu order.
   Most values come from src/data/cs2_video.txt (lib/video.ts); the few
   the game doesn't store there come from profile.video. */
const v = profile.video;
const s = (x: string | undefined) => (knownStr(x) ? x : undefined);
const enabled = (x: boolean | undefined) => (knownBool(x) ? (x ? "Enabled" : "Disabled") : undefined);
const fromFile = (label: string) => VIDEO_SETTINGS.find((x) => x.label === label)?.read(videoCfg);

const videoRows: Row[] = (
  [
    // Display
    ["Brightness", s(v.brightness)],
    ["Display Mode", fromFile("Display Mode")],
    ["Aspect Ratio", fromFile("Aspect Ratio")],
    ["Resolution", fromFile("Resolution")],
    ["Refresh Rate", fromFile("Refresh Rate")],
    // Advanced Video
    ["Boost Player Contrast", enabled(v.boostPlayerContrast)],
    ...VIDEO_SETTINGS.filter((x) => x.group === "Advanced Video").map((x) => [x.label, x.read(videoCfg)] as const),
    // Outside the Video menu
    ["Scaling Mode (GPU driver)", s(v.scalingMode)],
    ["Max FPS (fps_max)", anyNum(v.maxFps) ? (v.maxFps === 0 ? "Unlimited" : fmtNum(v.maxFps)) : undefined],
  ] as ReadonlyArray<readonly [string, string | undefined]>
)
  .filter((r): r is readonly [string, string] => r[1] !== undefined)
  // On/off style values render as pills, like the other tabs
  .map(([label, value]) =>
    value === "Enabled" || value === "Disabled" ? { label, value, kind: "bool" as const, on: value === "Enabled" } : { label, value },
  );

export const binds = profile.binds.filter((x) => knownStr(x.key) && knownStr(x.action));
const bindRows: Row[] = binds.map((x) => ({ label: x.action, value: x.key }));

export const launchOptions: string | null = knownStr(profile.launchOptions) ? profile.launchOptions.trim() : null;

/** Tabs in display order. Empty tabs are dropped. The crosshair tab always
 *  has a live preview, so it survives as long as it has any row. */
export const tabs: Tab[] = [
  { id: "mouse", label: "Mouse", rows: mouseRows },
  { id: "crosshair", label: "Crosshair", rows: crosshairRows },
  { id: "viewmodel", label: "Viewmodel", rows: viewmodelRows },
  { id: "video", label: "Video", rows: videoRows },
  { id: "launch", label: "Launch Options", rows: [], code: launchOptions ?? undefined },
  { id: "binds", label: "Binds", rows: bindRows },
].filter((t) => t.rows.length > 0 || t.code);

/* ---------- autoexec.cfg (generated client-side from this string) ---------- */

function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function buildAutoexec(): string {
  const L: string[] = [`// autoexec.cfg — ${profile.handle}`, `// generated from ${profile.handle}'s website`, ""];
  const add = (cmd: string, val: string | number | boolean | undefined | null) => {
    if (val === undefined || val === null) return;
    const out = typeof val === "boolean" ? (val ? 1 : 0) : val;
    L.push(`${cmd} "${out}"`);
  };

  L.push("// mouse");
  if (ok("sensitivity") && knownNum(m.sensitivity)) add("sensitivity", m.sensitivity);
  if (ok("zoomSensitivity") && knownNum(m.zoomSensitivity)) add("zoom_sensitivity_ratio", m.zoomSensitivity);

  L.push("", "// crosshair");
  add("cl_crosshairstyle", c.style);
  add("cl_crosshairsize", c.length); // CS2's console name for the arm length
  add("cl_crosshairthickness", c.thickness);
  add("cl_crosshairgap", c.gap);
  add("cl_crosshair_drawoutline", c.outline);
  if (c.outline && anyNum(c.outlineThickness)) add("cl_crosshair_outlinethickness", c.outlineThickness);
  add("cl_crosshairdot", c.dot);
  add("cl_crosshair_t", c.tStyle);
  const rgb = hexToRgb(c.color);
  if (rgb) {
    add("cl_crosshaircolor", 5);
    add("cl_crosshaircolor_r", rgb[0]);
    add("cl_crosshaircolor_g", rgb[1]);
    add("cl_crosshaircolor_b", rgb[2]);
  }
  add("cl_crosshairusealpha", 1);
  add("cl_crosshairalpha", c.alpha);
  if (knownBool(c.followRecoil)) add("cl_crosshair_recoil", c.followRecoil);
  if (anyNum(c.sniperWidth)) add("cl_crosshair_sniper_width", c.sniperWidth);

  if (!vm.todo) {
    L.push("", "// viewmodel");
    add("viewmodel_fov", vm.fov);
    add("viewmodel_offset_x", vm.offsetX);
    add("viewmodel_offset_y", vm.offsetY);
    add("viewmodel_offset_z", vm.offsetZ);
    if (anyNum(vm.presetPos)) add("viewmodel_presetpos", vm.presetPos);
  }

  if (anyNum(v.maxFps)) {
    L.push("", "// video");
    add("fps_max", v.maxFps);
  }

  if (binds.length) {
    L.push("", "// binds (set these up in-game; listed for reference)");
    for (const x of binds) L.push(`// ${x.key} — ${x.action}`);
  }

  L.push("", 'echo "autoexec loaded"', "host_writeconfig", "");
  return L.join("\n");
}

/* ---------- gear / rig ---------- */

export const gear = profile.gear
  .filter((g) => knownStr(g.name))
  .map((g) => ({ ...g, note: knownStr(g.note) ? g.note : undefined }));

export const rig = profile.pc.filter((p) => knownStr(p.name));

/* ---------- videos ---------- */

const YT_ID = /^[A-Za-z0-9_-]{11}$/;
export const videos = profile.videos
  .filter((x) => YT_ID.test(x.id))
  .map((x) => ({ ...x, title: knownStr(x.title) ? x.title : "", description: knownStr(x.description) ? x.description : "" }));

/* ---------- links ---------- */

const LINK_META: Record<LinkKey, { label: string; hint?: string }> = {
  steam: { label: "Steam" },
  csstats: { label: "CSStats", hint: "Check the evidence" },
  youtube: { label: "YouTube" },
  faceit: { label: "FACEIT" },
  leetify: { label: "Leetify" },
  twitch: { label: "Twitch" },
  x: { label: "X" },
  discord: { label: "Discord" },
};

/** Valid URL that isn't a placeholder. */
const knownUrl = (u: unknown): u is string => {
  if (!knownStr(u)) return false;
  try {
    new URL(u);
    return true;
  } catch {
    return false;
  }
};

/**
 * Short, readable handle for a link card:
 * "https://steamcommunity.com/id/metronix9/"   → "metronix9"
 * "https://csstats.gg/player/76561197961132406" → "76561197961132406"
 * "https://youtube.com/@name"                  → "@name"
 * Falls back to the hostname when the URL has no path.
 */
const prettyUrl = (u: string) => {
  const url = new URL(u);
  const last = url.pathname.split("/").filter(Boolean).pop();
  return last ? decodeURIComponent(last) : url.hostname.replace(/^www\./, "");
};

/** All valid URLs for a link type. A list means several accounts: the first is the main one. */
const urlsFor = (k: LinkKey): string[] => [profile.links[k] ?? []].flat().filter(knownUrl);

/** One card per URL; same-type cards stay next to each other. Extra accounts get an "Alt account" tag. */
export const links = (Object.keys(LINK_META) as LinkKey[]).flatMap((k) =>
  urlsFor(k).map((url, i) => ({
    key: k,
    url,
    label: LINK_META[k].label,
    hint: i === 0 ? LINK_META[k].hint : "Alt account",
    display: prettyUrl(url),
  })),
);

export const youtubeUrl = urlsFor("youtube")[0] ?? null;
export const steamUrl = urlsFor("steam")[0] ?? null; // main account (home screen button)

export { profile };
