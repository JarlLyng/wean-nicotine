#!/usr/bin/env node
/**
 * Copy the design system's store button for Wean Nicotine into the site (#393).
 *
 *   node scripts/sync-store.mjs v1.21.0
 *
 * The fragments are generated in iamjarl-design from its app registry, so the
 * price, the OS floor, the campaign link and the click event have one source.
 * This copies the ones the site uses into src/store/, where StoreButton.astro
 * renders them into the served HTML.
 *
 * One change on the way in: the badge images. The fragments load them from
 * jsDelivr; the site serves nothing from third parties, so the badges are
 * copied to public/badges/ and the URLs point there. The hub's store_check.py
 * compares the link and the facts line, which stay byte for byte as generated.
 *
 * Run it again with a newer tag when the design system changes a price or an
 * OS floor, and commit what it writes.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const TAG = process.argv[2];
if (!/^v\d+\.\d+\.\d+$/.test(TAG ?? '')) {
  console.error('Usage: node scripts/sync-store.mjs vX.Y.Z');
  process.exit(1);
}

const APP = 'wean-nicotine';
const LOCALES = { en: 'en-us', da: 'da-dk', sv: 'sv-se', no: 'no-no' };
const BASE = `https://cdn.jsdelivr.net/gh/jarllyng/iamjarl-design@${TAG}`;
const SITE = join(dirname(fileURLToPath(import.meta.url)), '..');

async function fetchText(path) {
  const res = await fetch(`${BASE}/${path}`);
  if (!res.ok) throw new Error(`${res.status} for ${BASE}/${path}`);
  return res.text();
}

function write(rel, content) {
  const file = join(SITE, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
  console.log(`wrote ${rel}`);
}

const selfHost = (html) => {
  const out = html.replaceAll(`${BASE}/badges/`, '/badges/');
  // Anything the browser would load (src, srcset) must be ours. The store
  // link itself (href) is allowed to leave the site; it is a link, not a load.
  const loaded = [...out.matchAll(/\b(?:src|srcset)="([^"]+)"/g)].map((m) => m[1]);
  const external = loaded.filter((url) => !url.startsWith('/') || url.startsWith('//'));
  if (external.length)
    throw new Error(`a fragment still loads from elsewhere: ${external.join(', ')}`);
  return out;
};

// Hero, midpage and nav fragments plus the JSON-LD Offer, per locale.
for (const loc of Object.keys(LOCALES)) {
  for (const variant of ['', '.midpage', '.nav']) {
    const name = `${APP}.${loc}${variant}.html`;
    write(`src/store/${name}`, selfHost(await fetchText(`dist/store/${name}`)));
  }
  write(
    `src/store/${APP}.${loc}.offer.json`,
    await fetchText(`dist/store/${APP}.${loc}.offer.json`),
  );
}
write(`src/store/${APP}.head.html`, await fetchText(`dist/store/${APP}.head.html`));

// The badges, black for light and white for dark, per locale.
for (const code of Object.values(LOCALES)) {
  for (const tone of ['black', 'white']) {
    const name = `app-store-${tone}-${code}.svg`;
    write(`public/badges/${name}`, await fetchText(`badges/${name}`));
  }
}

write('src/store/VERSION', `${TAG}\n`);
