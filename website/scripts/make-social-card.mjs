#!/usr/bin/env node
/**
 * The social card: public/og-image.png, which is both the site's og:image and
 * the repo's GitHub social preview (the hub's DESIGN.md, "Social cards").
 *
 *   node scripts/make-social-card.mjs
 *
 * On the site's identity since the redesign (#396): the misty grey-blue, the
 * charcoal, Instrument Sans and the hero's shoreline with its magenta
 * waterline, beside the Today screen in the kit's plain phone. It is drawn
 * from the same files the site serves (public/iamjarl-design/, the drawing in
 * src/design/, the capture in src/assets/site/), rendered by headless Chrome
 * at 1200 x 630. Set CHROME to another Chromium's binary if Chrome is not in
 * /Applications.
 *
 * Remake it when the headline, the identity or the Today capture changes: the
 * card is public imagery, and an old one advertises an old page. Then upload
 * it again by hand in the repo's Settings, Social preview.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SITE = join(dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT = join(SITE, 'public/og-image.png');
const url = (rel) => pathToFileURL(join(SITE, rel)).href;

// The English hero (src/i18n/home-copy.ts): the owner-approved headline, and
// the first sentence of the line under it.
const NAME = 'Wean Nicotine';
const HEADLINE = 'A gentler way to quit nicotine.';
const LINE = 'Cut down on snus and nicotine pouches a little at a time, at a pace you choose.';
const DOMAIN = 'weannicotine.iamjarl.com';

const shoreline = readFileSync(join(SITE, 'src/design/drawings/shoreline.svg'), 'utf8');

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<link rel="preload" href="${url('public/iamjarl-design/fonts/instrument-sans-latin-wght-normal.woff2')}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${url('public/iamjarl-design/css/tokens.css')}">
<link rel="stylesheet" href="${url('public/iamjarl-design/identity/wean-nicotine.css')}">
<link rel="stylesheet" href="${url('public/iamjarl-design/fonts/instrument-sans.css')}">
<link rel="stylesheet" href="${url('public/iamjarl-design/kit/kit.css')}">
<style>
  html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; }
  body { position: relative; }
  /* Text well away from every edge: platforms crop a little differently. */
  .words { position: absolute; left: 72px; top: 76px; width: 610px; display: flex; flex-direction: column; align-items: flex-start; }
  .name { font-family: var(--ij-font-display); font-weight: 600; font-size: 32px; letter-spacing: -0.01em; margin: 0 0 26px; }
  .name::before { content: ""; display: inline-block; width: 14px; height: 14px; border-radius: 50%; background: var(--ij-color-accent); margin-right: 14px; vertical-align: 0.12em; }
  h1 { font-family: var(--ij-font-display); font-weight: 500; font-size: 66px; line-height: 1.04; letter-spacing: -0.025em; margin: 0; text-wrap: balance; }
  .ij-drawing { width: 380px; margin: 14px 0 12px -6px; }
  .line { font-size: 26px; line-height: 1.42; color: var(--ij-color-text-secondary); margin: 0; max-width: 540px; }
  .domain { position: absolute; left: 72px; bottom: 64px; margin: 0; font-size: 24px; font-weight: 600; color: var(--ij-color-accent-text); }
  /* The product, bleeding off the bottom edge. */
  .ij-phone { position: absolute; right: 100px; top: 62px; }
</style>
</head>
<body class="ij-page">
  <div class="words">
    <p class="name">${NAME}</p>
    <h1>${HEADLINE}</h1>
    ${shoreline}
    <p class="line">${LINE}</p>
  </div>
  <p class="domain">${DOMAIN}</p>
  <div class="ij-phone" style="--ij-phone-width: 304px">
    <div class="ij-phone__screen"><img src="${url('src/assets/site/tour-today.jpg')}" alt=""></div>
  </div>
</body>
</html>`;

const dir = mkdtempSync(join(tmpdir(), 'wean-card-'));
const page = join(dir, 'card.html');
writeFileSync(page, html);
execFileSync(
  CHROME,
  [
    '--headless=new',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    '--window-size=1200,630',
    '--virtual-time-budget=4000',
    '--allow-file-access-from-files',
    `--user-data-dir=${join(dir, 'profile')}`,
    `--screenshot=${OUT}`,
    pathToFileURL(page).href,
  ],
  { stdio: 'ignore' },
);
console.log(`wrote public/og-image.png, ${Math.round(statSync(OUT).size / 1024)} KB`);
