# Documentation Index

This directory is the entrypoint for understanding the repository.

Purpose:
- Explain how documentation in this repository is organized and how it should be used

Audience:
- Maintainers onboarding to the repo
- LLMs deciding which documents to retrieve first

Source of truth:
- Code is canonical for behavior
- This file is canonical for documentation navigation and documentation rules

Related files:
- [`AI_CONTEXT.md`](./AI_CONTEXT.md)
- [`README.md`](../README.md)

Update when:
- A document is added, removed, or repurposed
- Documentation conventions change

If you are a human or an LLM, read documents in this order:

1. [`AI_CONTEXT.md`](./AI_CONTEXT.md) for the canonical repo and app overview.
2. [`README.md`](../README.md) for setup, product framing, and release workflow.
3. [GitHub Issues](https://github.com/JarlLyng/wean-nicotine/issues) for all open tasks (labels: P1/P2/P3, seo, aso, website, marketing).
4. Domain-specific docs from the map below.

## Documentation Rules

- Code is the final source of truth for behavior.
- Architecture and domain summaries live in [`AI_CONTEXT.md`](./AI_CONTEXT.md).
- Product/developer onboarding lives in [`README.md`](../README.md).
- Decision records explain why something was chosen, not how every current detail works.
- Strategy docs describe intent and direction. They must not override code.

## Document Contract

Every durable document in this directory should state:

- `Purpose`: why the document exists
- `Audience`: who should read it
- `Source of truth`: what wins if the document conflicts with something else
- `Related files`: the most relevant code or docs
- `Update when`: which changes should trigger a docs update

This makes the docs easier for LLMs to classify correctly and reduces accidental prompt pollution from stale guidance.

## Source Of Truth Map

| Area | Primary source | Notes |
| --- | --- | --- |
| App routing and screen ownership | `app/` | Expo Router file structure is canonical. |
| UI tokens and visual language | `lib/design.ts`, `lib/theme.ts` | Docs may summarize, but code defines exact values. |
| Shared UI primitives | `components/`, `components/ui/` | Reusable building blocks used by routes. |
| Domain types | `lib/models.ts` | Canonical TypeScript model definitions. |
| Tapering formula | `lib/taper-plan.ts` | Use code for exact rounding and clamping behavior. |
| Storage schema and initialization | `lib/db.ts` | Includes tables, indexes, and migrations. |
| Storage operations | `lib/db-*.ts` | Behavior is split by domain table. |
| Notifications | `lib/notifications.ts` | Includes Expo Go limitation and scheduling behavior. |
| Error reporting | `lib/sentry.ts` | DSN resolution and production/dev behavior live here. |
| Marketing site structure | `website/src/` | Astro pages and shared site metadata. |
| SEO Components & Layouts | `SeoLandingLayout.astro` | Standardized wrapper for high-intent pages. |
| App Store Tracking | `website/src/lib/site.ts` | `getCampaignAppStoreUrl` logic for PT/CT tokens. |
| SEO direction | [`SEO_STRATEGY.md`](./SEO_STRATEGY.md) | Strategic guidance and technical scale-out rules. |
| Storage rationale | [`decisions/storage.md`](./decisions/storage.md) | Why SQLite was chosen. |

## Repository Map

- `app/`: Mobile app routes and navigation groups.
- `components/`: Shared app UI wrappers and primitives.
- `hooks/`: App initialization and platform/theme hooks.
- `lib/`: Business logic, storage, notifications, analytics, design tokens.
- `plugins/`: Expo config plugins for native build behavior.
- `website/`: Astro marketing site and SEO landing pages.
- `docs/`: Product, operational, architectural, and strategy documentation.

## Document Catalog

### In this directory (`docs/`)

- [`AI_CONTEXT.md`](./AI_CONTEXT.md): Canonical repo overview for fast machine and human orientation.
- [`design.md`](./design.md): Design-system principles and token usage.
- [`SEO_STRATEGY.md`](./SEO_STRATEGY.md): SEO positioning and content architecture for the website.
- [`SENTRY.md`](./SENTRY.md): Sentry setup, privacy hardening, and troubleshooting.
- [`APP_STORE_METADATA.md`](./APP_STORE_METADATA.md): App Store listing copy and metadata for all storefronts.
- [`PRIVACY_APP_STORE.md`](./PRIVACY_APP_STORE.md): App privacy answers for App Store Connect.
- [`decisions/storage.md`](./decisions/storage.md): ADR for local persistence.

### At the repo root

- [`../README.md`](../README.md): Product framing, setup instructions, release workflow.
- [`../CONTRIBUTING.md`](../CONTRIBUTING.md): How outside contributors should report bugs, suggest features, or open PRs.
- [`../SECURITY.md`](../SECURITY.md): Vulnerability disclosure policy.
- [`../CODEOWNERS`](../CODEOWNERS): Auto-review-request configuration.
- [`../LICENSE`](../LICENSE): MIT license.

## Change Guidance

- If you change app behavior, update code first, then adjust docs that summarize that behavior.
- If you add a new subsystem, add it to [`AI_CONTEXT.md`](./AI_CONTEXT.md) and this index.
- If a document conflicts with code, treat the document as stale and fix it.
- Prefer concise, explicit statements over narrative prose when documenting architecture or operational steps.
