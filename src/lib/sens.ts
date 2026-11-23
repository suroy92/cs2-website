/**
 * CS2 mouse & view math — the single source of truth for the sens tester.
 *
 * - One mouse count turns the view `0.022 × sensitivity` degrees, both
 *   horizontally (m_yaw) and vertically (m_pitch). CS2 always uses raw input,
 *   no acceleration. Resolution / aspect / monitor size don't change this.
 * - CS2 keeps a fixed VERTICAL field of view of ~73.74° (90° horizontal at
 *   4:3) and widens or narrows the horizontal view with the aspect ratio.
 * - "Stretched" draws the game's (narrower) image and the GPU/monitor widens
 *   it to fill the screen: same turn per count, faster horizontal on-screen
 *   motion. "Black bars" shows the image at its own shape, centred.
 */

export const M_YAW = 0.022; // degrees per count per 1.0 sensitivity
export const M_PITCH = 0.022;
export const PITCH_LIMIT = 89; // degrees up / down

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

/** Vertical FOV: 90° horizontal at 4:3 → 73.7398° vertical. */
export const VFOV = deg(2 * Math.atan(Math.tan(rad(45)) * (3 / 4)));

/** Horizontal FOV CS2 shows for a given render aspect ratio (width / height). */
export const hfovFor = (aspect: number) => deg(2 * Math.atan(Math.tan(rad(VFOV / 2)) * aspect));

export const eDPI = (dpi: number, sens: number) => dpi * sens;
export const degPerCount = (sens: number) => M_YAW * sens;
/** Mouse travel for a full 360° turn, in cm. */
export const cm360 = (dpi: number, sens: number) => (2.54 * 360) / (dpi * sens * M_YAW);

export type Scaling = "stretched" | "blackbars" | "native";

export interface ViewSetup {
  gameW: number; // in-game resolution
  gameH: number;
  monW: number; // monitor resolution
  monH: number;
  scaling: Scaling;
}

export interface ViewModel {
  /** aspect the 3D scene is rendered at */
  renderAspect: number;
  /** pixel size of the rendered image (what the GPU draws) */
  renderW: number;
  renderH: number;
  hfov: number;
  vfov: number;
  /** how much the image is widened on screen (1 = not stretched) */
  hStretch: number;
  /** horizontal on-screen speed at the crosshair vs. native, same sens */
  hSpeedVsNative: number;
  /** fraction of the monitor's width the image covers (black bars < 1) */
  widthFraction: number;
}

export function viewModel(s: ViewSetup): ViewModel {
  const monAspect = s.monW / s.monH;
  const native = s.scaling === "native";
  const renderAspect = native ? monAspect : s.gameW / s.gameH;
  const renderW = native ? s.monW : s.gameW;
  const renderH = native ? s.monH : s.gameH;
  const hfov = hfovFor(renderAspect);

  // Width the image occupies on the monitor, in monitor pixels.
  const shownW = s.scaling === "stretched" ? s.monW : Math.min(s.monW, s.monH * renderAspect);
  // Pixels per radian at the screen centre, horizontally — vs. native 16:9-style.
  const pxPerRad = shownW / 2 / Math.tan(rad(hfov / 2));
  const nativePxPerRad = s.monW / 2 / Math.tan(rad(hfovFor(monAspect) / 2));

  return {
    renderAspect,
    renderW,
    renderH,
    hfov,
    vfov: VFOV,
    hStretch: s.scaling === "stretched" ? monAspect / renderAspect : 1,
    hSpeedVsNative: pxPerRad / nativePxPerRad,
    widthFraction: shownW / s.monW,
  };
}

/** "1280x1024" → 5:4 style label for common ratios, else the decimal. */
export function aspectLabel(w: number, h: number): string {
  const r = w / h;
  const known: [number, string][] = [
    [4 / 3, "4:3"],
    [5 / 4, "5:4"],
    [16 / 10, "16:10"],
    [16 / 9, "16:9"],
    [21 / 9, "21:9"],
    [64 / 27, "21:9"],
  ];
  const hit = known.find(([v]) => Math.abs(v - r) < 0.01);
  return hit ? hit[1] : `${r.toFixed(2)}:1`;
}
