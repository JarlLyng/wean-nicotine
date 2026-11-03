# Scripts

Local maintainer tooling. Not part of the app or website build.

## `changelog-section.mjs`: one version's changelog notes

Prints a version's section of `CHANGELOG.md`, heading included:

```bash
node scripts/changelog-section.mjs 1.6.2
```

The Release workflow (`.github/workflows/release.yml`) uses it as the notes for
that version's GitHub Release. It exits 1 when the version has no section, so a
tag pushed before its changelog entry fails instead of publishing an empty
release.

## `encode-loop.swift`: the site's Today loop

Trims and encodes the hero loop and its poster from a simulator recording, with
nothing beyond macOS. [`docs/SITE_CAPTURES.md`](../docs/SITE_CAPTURES.md) has the
steps and the arguments.
