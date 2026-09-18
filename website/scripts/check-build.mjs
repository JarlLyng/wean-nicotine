/**
 * Post-build sanity checks on dist/.
 *
 * A passing `astro build` says the site compiled, not that it is correct.
 * These are the checks that would have caught real bugs we shipped:
 *
 *  - hreflang pointing at URLs that do not exist. `useTranslatedPath` only
 *    swaps the language prefix, so a page that claims a locale it has no
 *    translation for emits a link to a 404. That shipped on
 *    /how-to-reduce-snus/ and the 404 page.
 *  - internal links to pages that do not exist, same root cause, different
 *    symptom (a dead link in the language switcher or body copy).
 *  - reciprocity: if A claims B as an alternate, B must claim A back.
 *    Google ignores non-reciprocal hreflang.
 *  - App Store links that are not tracked, or tracked inconsistently. 46 of
 *    them were dark until #304, including the footer on every page, and the
 *    ones that did fire used four different dimension shapes.
 *  - orphans: a page no other page links to. A sitemap entry is not a path a
 *    reader can follow, and a crawler weighs an unlinked page accordingly.
 *    Three Nordic guides sat orphaned this way until #303, found by exactly
 *    this crawl.
 *
 * Run with `npm run check` in website/.
 */
import { readFileSync, existsSync } from 'node:fs';
import { globSync } from 'node:fs';
import { join, dirname } from 'node:path';

const DIST = 'dist';
const ORIGIN = 'https://weannicotine.iamjarl.com';

const files = globSync('**/*.html', { cwd: DIST });
if (files.length === 0) {
  console.error('check-build: no HTML in dist/. Run `npm run build` first.');
  process.exit(1);
}

/** Map a site-absolute path to the file that serves it, or null. */
function resolve(path) {
  const clean = path.split(/[?#]/)[0];
  const p = clean.replace(/^\/+|\/+$/g, '');
  if (p === '') return existsSync(join(DIST, 'index.html')) ? 'index.html' : null;
  // A path with an extension is served as that literal file (rss.xml,
  // og-image.png). Everything else is a route, emitted as p/index.html or
  // p.html. The extension test matters: without it, `/da/` would resolve to
  // the `dist/da` DIRECTORY rather than to `dist/da/index.html`, which then
  // breaks the reciprocity comparison below.
  const hasExtension = /\.[a-z0-9]+$/i.test(p);
  const candidates = hasExtension ? [p] : [join(p, 'index.html'), `${p}.html`];
  for (const cand of candidates) {
    if (existsSync(join(DIST, cand))) return cand;
  }
  return null;
}

/**
 * The site-absolute path of an href, or null when it points somewhere else.
 * Compares parsed origins rather than testing a string prefix, which would
 * also accept `weannicotine.iamjarl.com.example` and then slice it into a
 * path that resolves to nothing useful.
 */
function sitePath(href) {
  let url;
  try {
    url = new URL(href, ORIGIN);
  } catch {
    return null;
  }
  if (url.origin !== ORIGIN) return null;
  return (url.pathname || '/') + url.search;
}

const problems = [];
const alternates = new Map(); // file -> Set of claimed paths
const inbound = new Map(); // resolved file -> Set of files linking to it

for (const file of files.sort()) {
  const html = readFileSync(join(DIST, file), 'utf8');

  // hreflang targets must exist
  const claimed = new Set();
  for (const m of html.matchAll(
    /<link\s+rel="alternate"\s+hreflang="([^"]+)"\s+href="([^"]+)"/g,
  )) {
    const [, lang, href] = m;
    const path = sitePath(href);
    if (path === null) continue;
    if (lang !== 'x-default') claimed.add(path);
    if (!resolve(path)) problems.push(`${file}: hreflang="${lang}" -> ${path} does not exist`);
  }
  alternates.set(file, claimed);

  // internal links must exist, and record who links to what
  for (const m of html.matchAll(/<a\s[^>]*href="(\/[^"]*)"/g)) {
    const path = m[1];
    if (path.startsWith('//')) continue;
    const target = resolve(path);
    if (!target) {
      problems.push(`${file}: link -> ${path} does not exist`);
      continue;
    }
    if (target !== file) {
      if (!inbound.has(target)) inbound.set(target, new Set());
      inbound.get(target).add(file);
    }
  }
}

// hreflang must be reciprocal
for (const [file, claimed] of alternates) {
  for (const path of claimed) {
    const target = resolve(path);
    if (!target) continue; // already reported above
    const back = alternates.get(target);
    if (!back) continue;
    const selfPaths = [...alternates.get(file)];
    const claimsUsBack = [...back].some((p) => resolve(p) === file);
    if (!claimsUsBack && selfPaths.length > 1) {
      problems.push(`${file}: claims ${path} as an alternate, but it does not claim back`);
    }
  }
}

// Every App Store link must carry the same event with a placement and a
// locale, or the click data cannot tell surfaces apart (#304).
const PLACEMENTS = new Set(['header', 'hero', 'midpage', 'bottom-cta', 'in-article', 'footer']);
for (const file of files.sort()) {
  const html = readFileSync(join(DIST, file), 'utf8');
  for (const m of html.matchAll(/<a\s[^>]*href="https:\/\/apps\.apple\.com[^"]*"[^>]*>/g)) {
    const tag = m[0];
    const attr = (k) => tag.match(new RegExp(`data-umami-event-${k}="([^"]*)"`))?.[1];
    if (!/data-umami-event="app-store-click"/.test(tag)) {
      problems.push(`${file}: App Store link with no app-store-click event`);
      continue;
    }
    const placement = attr('placement');
    if (!placement) problems.push(`${file}: App Store link has no placement`);
    else if (!PLACEMENTS.has(placement))
      problems.push(`${file}: App Store link has unknown placement "${placement}"`);
    if (!attr('locale')) problems.push(`${file}: App Store link has no locale`);
  }
}

// Every page needs at least one inbound link. 404 is reachable by definition
// and is noindex, so it is exempt.
const EXEMPT_FROM_INBOUND = new Set(['404.html', 'index.html']);
for (const file of files.sort()) {
  if (EXEMPT_FROM_INBOUND.has(file)) continue;
  if (!inbound.get(file)?.size) {
    problems.push(`${file}: no other page links to it (orphan)`);
  }
}

if (problems.length) {
  console.error(`check-build: ${problems.length} problem(s)\n`);
  for (const p of problems) console.error('  ' + p);
  process.exit(1);
}
console.log(`check-build: ${files.length} pages, hreflang and internal links all resolve.`);
