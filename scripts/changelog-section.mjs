#!/usr/bin/env node
/**
 * Print one version's section of CHANGELOG.md, heading included.
 *
 *   node scripts/changelog-section.mjs 1.6.2
 *
 * Used by .github/workflows/release.yml as the notes for that version's
 * GitHub Release (#104). Exits 1 if the version has no section, so a tag
 * pushed before its changelog entry fails loudly instead of publishing an
 * empty release.
 */
import { readFileSync } from 'node:fs';

const version = process.argv[2]?.replace(/^v/, '');
if (!version || !/^\d+\.\d+\.\d+$/.test(version)) {
  console.error('Usage: changelog-section.mjs <version>, e.g. 1.6.2');
  process.exit(1);
}

const lines = readFileSync(new URL('../CHANGELOG.md', import.meta.url), 'utf8').split('\n');
const start = lines.findIndex((l) => l.startsWith(`## [${version}]`));
if (start === -1) {
  console.error(`CHANGELOG.md has no "## [${version}]" section`);
  process.exit(1);
}
// A section ends at the next version heading, or for the oldest version at
// the link definitions ("[1.1.0]: https://...") that close the file.
const end = lines.findIndex(
  (l, i) => i > start && (l.startsWith('## [') || /^\[[^\]]+\]:\s/.test(l)),
);
const section = lines.slice(start, end === -1 ? undefined : end);
// Drop trailing blank lines and the "---" rule that sits above the links
while (section.length && /^(-{3,})?\s*$/.test(section.at(-1))) section.pop();
console.log(section.join('\n'));
