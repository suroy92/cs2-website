/**
 * postinstall guard — Windows Smart App Control / WDAC workaround.
 *
 * Some Windows machines refuse to load unsigned native Node binaries
 * ("An Application Control policy has blocked this file"). Astro 7 uses a
 * few napi-rs packages (the .astro compiler, the Markdown engine) whose
 * Windows binaries are unsigned. Each of them already falls back to a
 * WebAssembly build at runtime — but npm skips those packages by default
 * (cpu: "wasm32"). This script finds blocked bindings and installs the
 * matching `-wasm32-wasi` package. On any other machine it does nothing.
 */
import { createRequire } from "node:module";
import { execSync } from "node:child_process";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

if (process.platform !== "win32" || process.env.METRON_NATIVE_GUARD) process.exit(0);

const require = createRequire(import.meta.url);
const NM = "node_modules";
const SUFFIX = `-win32-${process.arch}-msvc`;

/** Collect top-level (and scoped) packages ending in -win32-<arch>-msvc. */
function findWinBindings() {
  const out = [];
  for (const entry of readdirSync(NM)) {
    if (entry.startsWith("@")) {
      for (const sub of readdirSync(join(NM, entry))) if (sub.endsWith(SUFFIX)) out.push(`${entry}/${sub}`);
    } else if (entry.endsWith(SUFFIX)) out.push(entry);
  }
  return out;
}

const toInstall = [];
for (const name of findWinBindings()) {
  const dir = join(NM, name);
  const nodeFile = readdirSync(dir).find((f) => f.endsWith(".node"));
  if (!nodeFile) continue;
  try {
    require(join(process.cwd(), dir, nodeFile));
  } catch (e) {
    if (!/Application Control|blocked/i.test(String(e?.message))) continue;
    // Always list every blocked binding: a --no-save install prunes other
    // unsaved packages, so they must all be installed in one command.
    const wasi = name.replace(SUFFIX, "-wasm32-wasi");
    const { version } = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
    toInstall.push(`${wasi}@${version}`);
  }
}

// Nothing to do if every needed fallback is already present.
const missing = toInstall.filter((spec) => !existsSync(join(NM, spec.slice(0, spec.lastIndexOf("@")))));
if (missing.length) {
  console.log(`[metron1x] Windows blocked unsigned native binaries; installing WASM fallbacks:\n  ${toInstall.join("\n  ")}`);
  execSync(`npm install --no-save --force --ignore-scripts ${toInstall.join(" ")}`, {
    stdio: "inherit",
    env: { ...process.env, METRON_NATIVE_GUARD: "1" },
  });
}
