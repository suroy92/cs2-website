# metron1x — personal CS2 site

A single-page, fully static site for my Counter-Strike 2 settings, gear, rig, videos and profile links. It's built with **Astro**, plain CSS and a few kilobytes of vanilla JS.

```bash
npm install
npm run dev        # http://localhost:4321
```

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with live reload |
| `npm run build` | Prepares the background slices, then builds static files into `dist/` |
| `npm run preview` | Serves `dist/` locally to test the production build |
| `npm run check` | Type-checks everything |

---

## Editing content

**Everything personal lives in [`src/data/profile.ts`](src/data/profile.ts).** You never need to touch a component.

### Hiding rules
The site hides anything it doesn't know yet:

- Any string that is `"TODO"`, contains `TODO`, or is empty is **hidden**.
- Fields commented `0 = unknown` (sensitivity, master volume) are hidden while they're `0`.
- `mouse.todo: ["pollingRate"]` hides the fields named in it. Delete a name once you've confirmed the value.
- `viewmodel.todo: true` hides the whole Viewmodel tab. Delete that line once the numbers are right.
- A settings tab with nothing left in it disappears.
- **eDPI** is calculated as `dpi × sensitivity`. It appears in the stats strip and the Mouse tab as soon as sensitivity isn't `0`.

### Update my settings
Change the values in `mouse`, `crosshair`, `viewmodel`, `video`, `audio`, `hud`, `launchOptions` or `binds`. For example:

```ts
mouse: { dpi: 1000, sensitivity: 0.9, ... }          // eDPI 900 now shows up
crosshair: { code: "CSGO-xxxxx-xxxxx-xxxxx-xxxxx-xxxxx", ... }  // "Copy crosshair code" button appears
launchOptions: "-novid -high +fps_max 0",             // Launch Options tab appears
binds: [{ action: "Jump throw", key: "Mouse 4" }],    // Binds tab appears
```

**Your real config files.** `src/data/autoexec.cfg` is what the **Download autoexec.cfg** button serves, byte for byte, including your comments and binds. `src/data/cs2_video.txt` feeds the Video tab. After changing settings in-game, refresh both with:

```bash
npm run sync-cfg   # copies them from your Steam folders, then commit & push
```

The script is set up with this PC's Steam paths. If they change, override them with `CS2_AUTOEXEC` / `CS2_VIDEO_CFG`. If `src/data/autoexec.cfg` is deleted, the button falls back to a config generated from `profile.ts`.

**Video settings** come straight from your game's own file. Copy
`C:\Program Files (x86)\Steam\userdata\<your-id>\730\local\cfg\cs2_video.txt` over
[`src/data/cs2_video.txt`](src/data/cs2_video.txt) and rebuild. [`src/lib/video.ts`](src/lib/video.ts) translates each entry into the name and option label shown in CS2's Video menu, in menu order. If a value isn't in its table, the row is hidden and the build prints a warning telling you what to add. Brightness, Boost Player Contrast, scaling mode and fps_max aren't stored in that file, so they live in `profile.video`.

The **crosshair preview** redraws itself from `size`, `gap`, `thickness`, `color`, `alpha`, `dot`, `outline` and `tStyle`. The **Download autoexec.cfg** button builds the file from whatever values are known.

### Add a video
Paste the 11-character ID from the YouTube URL:

```
https://www.youtube.com/watch?v=dQw4w9WgXcQ   →   dQw4w9WgXcQ
```

```ts
videos: [
  { id: "dQw4w9WgXcQ", title: "Ace on Mirage", description: "Optional one-liner" },
],
```

The Videos section, its nav link, and the "More on YouTube" button appear automatically once there's at least one valid ID. Also set `links.youtube` to your channel URL.

Thumbnails come from `i.ytimg.com` (max-res, with a fallback to HQ). The player only loads when someone clicks play, using the privacy-friendly `youtube-nocookie.com`.

### Update my hours
```ts
stats: { cs2Hours: 4120, ... }   // shows "4,000+"
```
The value is rounded down to the nearest 500, so it stays accurate between updates.

### Add or change gear
Add an entry to `gear` or `pc`. These categories get matching icons: Mouse, Keyboard, Mousepad, Headset, Monitor, Controller. Anything else gets a generic icon.

### Add more links
Uncomment or add `faceit`, `leetify`, `twitch`, `x` or `discord` under `links`. A card shows up for each one.

---

## Page navigation (no scrolling)

Each section is a full-screen **page**: Home → About → Settings → Gear → Videos (once you add some) → Links. Moving forward, the current page fades out upward and the next one fades in from below. Going back reverses it, and with reduced motion turned on it's a quick crossfade.

- **Ways to move:** nav links, buttons, the mouse wheel or trackpad, a vertical swipe on touch screens, Page Up/Down (and ↑/↓), and the dots on the right edge on desktop.
- **Long pages:** a page taller than the screen (mostly on phones) scrolls inside itself first. The wheel or swipe only turns the page once you're at its top or bottom edge.
- **URLs:** every page has one (`/#settings`, `/#gear`…), so links can be shared and the browser's back/forward buttons work.
- **Without JavaScript:** the pages simply stack and the site scrolls like a normal page.
- **The code:** all of this lives in [`src/components/PanelRouter.astro`](src/components/PanelRouter.astro). Any `<section data-panel data-label="…">` directly inside `<main>` becomes a page.

## The background scene

The art is a **fixed background behind the whole site**. A dark veil fades in on every page except the first one, so text stays readable. There are two versions:

| File | Used when | How |
|---|---|---|
| `src/assets/desktop_version.png` | the screen is wider than 4:5 (laptops, desktops, landscape tablets) | covers the screen |
| `src/assets/phone_version.png` | the screen is 4:5 or taller (phones, portrait tablets) | split into a top slice (moon, sakura) and a bottom slice (horizon, samurai), pinned to the top and bottom, with the empty sky stretching between them. Nothing gets cropped, whatever the phone's shape. |

Both are converted automatically to responsive AVIF/WebP and preloaded.

### Swapping the art
1. Replace either PNG, keeping the same file name. Bigger is better: 2560×1440 (desktop) and 1440×2560 or taller (phone). The current files are 1672 px, which looks fine but slightly soft on high-DPI screens.
2. Keep the **middle of each image calm**: dark sky, no text. Content sits there.
3. Run `npm run dev` or `npm run build`. The phone slices regenerate automatically. If the new phone art puts the moon or horizon somewhere else, adjust `CUT_TOP` / `CUT_BOTTOM` in [`scripts/prepare-images.mjs`](scripts/prepare-images.mjs). Both cuts must land in plain sky.
4. If the palette shifts, update [`src/styles/tokens.css`](src/styles/tokens.css).

### Social preview (`public/og.jpg`)
This is a static 1200×630 image showing the scene with the wordmark. To remake it, open [`design/og-template.html`](design/og-template.html) in Chrome at 1200×630 and take a screenshot, or replace `public/og.jpg` with any 1200×630 image.

The original wordmark artwork is kept in `design/background-original.png`. It's no longer used by the site.

---

## Deploying

The build output is plain static files in `dist/`.

### Vercel
1. Push this folder to a GitHub repo.
2. In Vercel, click **Add New → Project** and import the repo. It auto-detects Astro (build `npm run build`, output `dist`).
3. Deploy. The production URL is detected automatically for canonical and Open Graph tags.

### Netlify
1. Push to GitHub. In Netlify, click **Add new site → Import an existing project** and pick the repo.
2. `netlify.toml` already sets the build command and publish folder. Deploy.

### GitHub Pages
1. Push to a GitHub repo on the `main` branch.
2. In the repo, go to **Settings → Pages → Source** and choose **GitHub Actions**.
3. The included workflow ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)) builds and deploys on every push.
   - It assumes a *project* site at `https://<user>.github.io/<repo>/`.
   - For a *user* site (`<user>.github.io` repo), change `BASE_PATH` to `/` in the workflow.

### Custom domain / anywhere else
Set `SITE_URL` before building so canonical and OG URLs are correct:
```bash
SITE_URL=https://metron1x.gg npm run build
```

---

## Project structure

```
src/
  data/profile.ts         ← all your content
  lib/content.ts          ← filters out unknowns, formats values, builds tabs/links/autoexec
  lib/background.ts       ← background srcsets (shared by <Background> and the preloads)
  lib/types.ts            ← Profile type
  assets/                 ← desktop_version.png, phone_version.png (+ generated/ slices)
  styles/tokens.css       ← palette, fonts, spacing
  styles/global.css       ← base styles, cards, buttons, chips, toast
  layouts/Base.astro      ← <head>, SEO/OG tags, background, petals
  components/             ← Nav, Intro, Background, AboutStrip, StatStrip, SettingsTabs, CrosshairPreview,
                            GearGrid, RigRow, VideoCard, LinkCard, Footer, SectionHeading, Petals, Icon
  pages/index.astro       ← assembles the page
scripts/prepare-images.mjs ← phone slices, sky colors, apple-touch-icon.png
design/                   ← OG template + original artwork (not shipped)
scripts/ensure-native.mjs ← Windows workaround (see below)
```

## Windows note: "An Application Control policy has blocked this file"
Windows Smart App Control can block some of Astro's unsigned native binaries. `scripts/ensure-native.mjs` runs automatically after `npm install` and before `dev`, `build` and `check`. If it detects a blocked binary, it installs the official WebAssembly fallback, which Astro then uses on its own. On other machines (and on Vercel, Netlify and GitHub) it does nothing.
