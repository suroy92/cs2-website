/**
 * Prepares derived images from the background art. Runs automatically
 * before `dev`, `build` and `check` (and manually via `npm run images`).
 *
 *  - Splits src/assets/phone_version.png into a TOP slice (moon + sakura)
 *    and a BOTTOM slice (horizon, samurai, city). The site pins them to the
 *    top and bottom of tall screens and fills the empty sky between them
 *    with a matching gradient — so nothing is cropped on any phone shape.
 *  - Samples the sky colors at both cut lines → src/assets/generated/bg-meta.json
 *  - public/apple-touch-icon.png from favicon.svg
 *
 * Tweak CUT_TOP / CUT_BOTTOM if a new phone image puts features elsewhere:
 * both cuts must land in plain sky.
 */
import sharp from "sharp";
import { mkdirSync, writeFileSync, statSync, existsSync } from "node:fs";

const PHONE = "src/assets/phone_version.png";
const OUT = "src/assets/generated";
const CUT_TOP = 0.31; // fraction of height: top slice = [0, CUT_TOP]
const CUT_BOTTOM = 0.56; // bottom slice = [CUT_BOTTOM, 1]

mkdirSync(OUT, { recursive: true });

// Skip work if outputs are newer than the source.
const meta = `${OUT}/bg-meta.json`;
const fresh = existsSync(meta) && statSync(meta).mtimeMs > statSync(PHONE).mtimeMs && statSync(meta).mtimeMs > statSync(new URL(import.meta.url)).mtimeMs;

if (!fresh) {
  const { width: W, height: H } = await sharp(PHONE).metadata();
  const topH = Math.round(H * CUT_TOP);
  const botY = Math.round(H * CUT_BOTTOM);

  await sharp(PHONE).extract({ left: 0, top: 0, width: W, height: topH }).png().toFile(`${OUT}/phone-top.png`);
  await sharp(PHONE).extract({ left: 0, top: botY, width: W, height: H - botY }).png().toFile(`${OUT}/phone-bottom.png`);

  // Median color of a pixel row (ignores the odd bright star).
  const { data, info } = await sharp(PHONE).raw().toBuffer({ resolveWithObject: true });
  const rowColor = (y) => {
    const ch = [[], [], []];
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * info.channels;
      for (let k = 0; k < 3; k++) ch[k].push(data[i + k]);
    }
    return "#" + ch.map((a) => a.sort((p, q) => p - q)[a.length >> 1].toString(16).padStart(2, "0")).join("");
  };

  writeFileSync(
    meta,
    JSON.stringify({ skyTop: rowColor(2), skyAtTopCut: rowColor(topH - 2), skyAtBottomCut: rowColor(botY + 2) }, null, 2) + "\n",
  );

  await sharp("public/favicon.svg", { density: 300 })
    .resize(180, 180, { fit: "contain", background: "#0a0b22" })
    .flatten({ background: "#0a0b22" })
    .png()
    .toFile("public/apple-touch-icon.png");

  console.log("✓ phone slices, bg-meta.json, apple-touch-icon.png generated");
}
