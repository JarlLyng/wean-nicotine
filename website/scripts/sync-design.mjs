#!/usr/bin/env node
/**
 * Copy what the site uses from the IAMJARL design system into the site (#393, #396).
 *
 *   node scripts/sync-design.mjs v1.32.1
 *
 * One release, all of it:
 *
 * - public/iamjarl-design/: the tokens, Wean's identity sheet, the display face,
 *   the marketing kit (kit.css, kit.js) and the <ij-nav> and <ij-footer>
 *   components, served from the site's own origin.
 * - src/design/: what is inlined at build time. The tidal-flats scene's
 *   magenta waterline (iamjarl-design#90) goes in the page's HTML right after
 *   its photo, where it takes the identity's accent (an <img> cannot). The
 *   photos themselves are Unsplash's, not the design system's, and live in
 *   src/assets/site/. The footer's cross-links come along too, so they are in
 *   the served HTML.
 * - src/store/ and public/badges/: the store button for each locale, from the
 *   design system's app registry, so the price, the OS floor, the campaign link
 *   and the click event have one source. StoreButton.astro renders them.
 *
 * The site loads nothing from a third party (check-build.mjs holds it to that),
 * so instead of jsDelivr links with integrity attributes, each file the release
 * notes give an SRI hash for is checked against that hash here, before anything
 * is written. A file that does not match stops the sync.
 *
 * Two changes on the way in, both to URLs: the font sheet points at the font
 * file beside it, and the store fragments' badges point at /badges/. The hub's
 * store_check.py compares the link and the facts line, which stay as generated.
 *
 * Run it again with a newer tag when the design system changes, and commit
 * what it writes.
 */
import { createHash } from 'node:crypto';
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const TAG = process.argv[2];
if (!/^v\d+\.\d+\.\d+$/.test(TAG ?? '')) {
  console.error('Usage: node scripts/sync-design.mjs vX.Y.Z');
  process.exit(1);
}

const APP = 'wean-nicotine';
const LOCALES = { en: 'en-us', da: 'da-dk', sv: 'sv-se', no: 'no-no' };
const SCENES = ['tidal-flats'];
// The files come from GitHub's copy of the tag. The design system's own links
// point at jsDelivr, which mirrors it; the store fragments' badge links are
// rewritten from that address below.
const SOURCE = `https://raw.githubusercontent.com/JarlLyng/iamjarl-design/${TAG}`;
const CDN = `https://cdn.jsdelivr.net/gh/jarllyng/iamjarl-design@${TAG}`;
const SITE = join(dirname(fileURLToPath(import.meta.url)), '..');

// Not from jsDelivr: it fetches a tagged file from GitHub the first time
// anyone asks for it, and that first request can hang or answer 503 for
// minutes (iamjarl-design#100). Each request still gets a deadline, and a few
// tries.
async function fetchBytes(path, tries = 6) {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(`${SOURCE}/${path}`, { signal: AbortSignal.timeout(30_000) });
      if (!res.ok) throw new Error(`${res.status} for ${SOURCE}/${path}`);
      return Buffer.from(await res.arrayBuffer());
    } catch (error) {
      if (attempt >= tries) throw error;
      console.log(`retrying ${path} (${error.message})`);
      await new Promise((resolve) => setTimeout(resolve, attempt * 5_000));
    }
  }
}

function write(rel, content) {
  const file = join(SITE, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
  console.log(`wrote ${rel}`);
}

// The release notes' integrity table: | `dist/kit/kit.css` | `sha384-…` |
const release = await fetch(
  `https://api.github.com/repos/JarlLyng/iamjarl-design/releases/tags/${TAG}`,
  { headers: { accept: 'application/vnd.github+json' } },
);
if (!release.ok) throw new Error(`${release.status} reading the release notes for ${TAG}`);
const notes = (await release.json()).body ?? '';
const SRI = new Map(
  [...notes.matchAll(/\|\s*`(dist\/[^`]+)`\s*\|\s*`(sha384-[A-Za-z0-9+/=]+)`\s*\|/g)].map((m) => [
    m[1],
    m[2],
  ]),
);
if (SRI.size === 0) throw new Error(`no integrity table in the release notes for ${TAG}`);

/** Fetch a file the release notes hash, and refuse it unless it matches. */
async function verified(path) {
  const expected = SRI.get(path);
  if (!expected) throw new Error(`the release notes give no hash for ${path}`);
  const bytes = await fetchBytes(path);
  const actual = `sha384-${createHash('sha384').update(bytes).digest('base64')}`;
  if (actual !== expected) throw new Error(`${path}: ${actual} does not match ${expected}`);
  return bytes;
}

// Collect everything first, so a mismatch leaves the site as it was.
const out = new Map();

// Served to the browser.
const SERVED = 'public/iamjarl-design';
for (const path of [
  'dist/css/tokens.css',
  `dist/identity/${APP}.css`,
  'dist/kit/kit.css',
  'dist/kit/kit.js',
  'dist/components/ij-nav.js',
  'dist/components/ij-footer.js',
]) {
  out.set(`${SERVED}/${path.slice('dist/'.length)}`, await verified(path));
}
const fontSheet = (await verified('dist/fonts/instrument-sans.css')).toString('utf8');
if (!fontSheet.includes("url('../../fonts/"))
  throw new Error('the font sheet no longer points at ../../fonts/; check the rewrite below');
out.set(`${SERVED}/fonts/instrument-sans.css`, fontSheet.replaceAll("url('../../fonts/", "url('./"));
for (const name of ['instrument-sans-latin-wght-normal.woff2', 'LICENSE-instrument-sans.txt']) {
  out.set(`${SERVED}/fonts/${name}`, await fetchBytes(`fonts/${name}`));
}

// Used at build time.
for (const name of SCENES) {
  out.set(`src/design/scenes/${name}.svg`, await fetchBytes(`dist/scenes/${APP}/${name}.svg`));
}
// The footer's cross-links to the rest of the portfolio, in the served HTML,
// where crawlers that run no JavaScript can follow them. One per language:
// they differ only in the portfolio link's words. English has no suffix.
for (const loc of Object.keys(LOCALES)) {
  const source = loc === 'en' ? `${APP}.html` : `${APP}.${loc}.html`;
  out.set(`src/design/cross-links.${loc}.html`, await fetchBytes(`dist/footers/${source}`));
}

// The store button. The page is light only, so it takes the black badge.
const selfHost = (html) => {
  const local = html.replaceAll(`${CDN}/badges/`, '/badges/');
  // Anything the browser would load (src, srcset) must be ours. The store
  // link itself (href) is allowed to leave the site; it is a link, not a load.
  const loaded = [...local.matchAll(/\b(?:src|srcset)="([^"]+)"/g)].map((m) => m[1]);
  const external = loaded.filter((url) => !url.startsWith('/') || url.startsWith('//'));
  if (external.length)
    throw new Error(`a fragment still loads from elsewhere: ${external.join(', ')}`);
  return local;
};
for (const loc of Object.keys(LOCALES)) {
  for (const variant of ['.black', '.midpage.black', '.footer.black', '.nav']) {
    const name = `${APP}.${loc}${variant}.html`;
    out.set(`src/store/${name}`, selfHost((await fetchBytes(`dist/store/${name}`)).toString('utf8')));
  }
  const offer = `${APP}.${loc}.offer.json`;
  out.set(`src/store/${offer}`, await fetchBytes(`dist/store/${offer}`));
}
out.set(`src/store/${APP}.head.html`, await fetchBytes(`dist/store/${APP}.head.html`));
for (const code of Object.values(LOCALES)) {
  const name = `app-store-black-${code}.svg`;
  out.set(`public/badges/${name}`, await fetchBytes(`badges/${name}`));
}

// Replace the generated folders whole, so a file the release dropped goes too.
for (const dir of [SERVED, 'src/design', 'src/store', 'public/badges']) {
  mkdirSync(join(SITE, dir), { recursive: true });
  for (const name of readdirSync(join(SITE, dir))) {
    rmSync(join(SITE, dir, name), { recursive: true, force: true });
  }
}
for (const [rel, content] of out) write(rel, content);
write('src/design/VERSION', `${TAG}\n`);
