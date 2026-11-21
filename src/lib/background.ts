/**
 * Site background pipeline — shared by <Background> (renders the layers)
 * and <Base> (emits matching preloads, so the preloaded URL is the one
 * the browser actually picks).
 *
 * Wide screens  (aspect > 4:5): desktop_version.png covers the viewport.
 * Tall screens  (aspect ≤ 4:5): phone_version.png, split into a top slice
 *   and a bottom slice (see scripts/prepare-images.mjs), each full-width,
 *   pinned to the top / bottom, with a sky gradient filling the gap.
 */
import { getImage } from "astro:assets";
import desktop from "../assets/desktop_version.png";
import phoneTop from "../assets/generated/phone-top.png";
import phoneBottom from "../assets/generated/phone-bottom.png";
import bgMeta from "../assets/generated/bg-meta.json";

/** Media query that switches to the phone art. Keep in sync with Background.astro CSS. */
export const TALL = "(max-aspect-ratio: 4/5)";
export const WIDE = "(min-aspect-ratio: 4001/5000)";

export const BG_ALT = ""; // purely decorative — content is described in the page itself
export const sky = bgMeta;

/** Astro skips widths larger than the source, so list generously. */
const DESKTOP_WIDTHS = [960, 1280, 1672, 2560, 3840];
const PHONE_WIDTHS = [480, 720, 941, 1440];

async function sources(src: typeof desktop, widths: number[]) {
  const usable = widths.filter((w) => w <= src.width);
  if (!usable.includes(src.width)) usable.push(src.width);
  const [avif, webp, fallback] = await Promise.all([
    getImage({ src, widths: usable, format: "avif", quality: 55 }),
    getImage({ src, widths: usable, format: "webp", quality: 72 }),
    getImage({ src, width: Math.min(src.width, 1280), format: "jpg", quality: 78 }),
  ]);
  return { avif: avif.srcSet.attribute, webp: webp.srcSet.attribute, fallback: fallback.src, width: src.width, height: src.height };
}

let cached: ReturnType<typeof build> | undefined;
async function build() {
  const [d, t, b] = await Promise.all([
    sources(desktop, DESKTOP_WIDTHS),
    sources(phoneTop, PHONE_WIDTHS),
    sources(phoneBottom, PHONE_WIDTHS),
  ]);
  return { desktop: d, phoneTop: t, phoneBottom: b };
}
export const getBackground = () => (cached ??= build());

/** Both layouts render the art at (at least) full viewport width. */
export const DESKTOP_SIZES = "100vw";
export const PHONE_SIZES = "100vw";
