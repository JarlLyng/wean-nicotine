# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Repository CHANGELOG (this file) and back-tagged historical releases.

## [1.3.1] - 2026-04-30

### Added
- Public-repo polish: issue templates, `CONTRIBUTING.md`, `SECURITY.md`, `CODEOWNERS`.
- CI workflow (`App (lint + typecheck + tests)`, `Website (build)`, CodeQL).
- Dependabot config grouping app + website minor/patch bumps.

### Fixed
- Sentry data leak: runtime aligned with public privacy claims (`lib/sentry-scrubber.ts`).
- Social previews: PNG `og:image` so renderers actually display it.
- Favicon variants generated from 1024×1024 source.
- CodeQL workflow-permissions finding closed; dependency overrides for `ws`, `brace-expansion`, `@tootallnate/once`, `uuid`.

### Changed
- Pace preset "Very gentle" → "Gentle" for consistency.
- Edit Plan inputs redesigned; design system bumped to v0.2.0.
- Toast slides in from the top with guaranteed contrast.

## [1.3.0] - 2026-04-15

### Added
- Cravings resisted tracking + milestones based on resisted cravings.
- Cost-savings tool with currency-aware projections.
- Reflection journal entries.
- App Store metadata synced with v1.3.0 submitted texts.

### Changed
- Website/App Store copy updated to reflect the new tooling.

## [1.2.0] - 2026-03-20

### Added
- "Why Taper" section across localized website pages.
- Localized landing pages (DA / SV / NO).
- Dependency refresh across the stack.

## [1.1.0] - 2026-02-25

### Added
- Sentry integration for app + website (privacy-conscious, scrubbed).
- Website UI styling and animation pass.
- Bumped dependencies; tuned Expo SDK.

## [1.0.0] - 2026-02-14

### Added
- Initial iOS App Store release.
- Onboarding (welcome → baseline → pace → price → triggers).
- Daily logging, undo, daily allowance.
- Progress screen with 7-day bar chart and milestones.
- Tools: breathing, urge-surfing, reflection.
- Settings: notifications, theme, edit plan, start over.
- Local-only SQLite persistence; no accounts, no cloud sync.

---

[Unreleased]: https://github.com/JarlLyng/wean-nicotine/compare/v1.3.1...HEAD
[1.3.1]: https://github.com/JarlLyng/wean-nicotine/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/JarlLyng/wean-nicotine/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/JarlLyng/wean-nicotine/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/JarlLyng/wean-nicotine/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/JarlLyng/wean-nicotine/releases/tag/v1.0.0
