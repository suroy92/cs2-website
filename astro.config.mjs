// @ts-check
import { defineConfig } from "astro/config";

/**
 * SITE_URL is used for canonical + Open Graph absolute URLs.
 * It's auto-detected on Vercel and Netlify; set it yourself elsewhere.
 * BASE_PATH is only needed for GitHub Pages project sites (e.g. "/cs2_website").
 */
const site =
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
  process.env.URL || // Netlify
  "http://localhost:4321";

export default defineConfig({
  site,
  base: process.env.BASE_PATH || "/",
  output: "static",
  trailingSlash: "ignore",
  build: { inlineStylesheets: "always" },
  image: { responsiveStyles: false },
  devToolbar: { enabled: false },
});
