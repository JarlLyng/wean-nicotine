# Contributing to Wean Nicotine

Thanks for your interest. Wean Nicotine is a small solo-built indie project — it has all the upsides (calm pace, focused vision, no committee) and all the downsides (one set of hands, slower replies). Reading this before opening an issue or PR helps both of us.

## Reporting a bug

Open a bug-report issue using the template. The most useful bug reports include:

- The screen or page where it happened
- iOS version + app version
- Steps to reproduce
- A screenshot or screen recording if visual

If the issue is a security vulnerability, please follow the [security policy](./SECURITY.md) and report privately instead.

## Suggesting a feature

Open a feature-request issue using the template. The clearer the problem you're trying to solve, the more useful the request — even if you don't have a solution in mind. Honest "not right now" answers are normal; they're not a judgement of your idea.

## Asking a general question

For anything that isn't a bug or feature request — questions about how the app works, account help, or just feedback — please email <support@iamjarl.com> or use the [support page](https://weannicotine.iamjarl.com/support). Issues are reserved for tracked work items.

## Sending a pull request

1. **Open an issue first** for anything beyond a typo. PRs that don't have an associated issue are easy to drop because there's no context.
2. **Branch from `main`** and keep changes focused. Smaller PRs ship faster.
3. **Match the existing conventions** — TypeScript, the IAMJARL design system tokens (`lib/design.ts`), the local-first architecture (no cloud calls), and the privacy guarantees in [`docs/SENTRY.md`](./docs/SENTRY.md).
4. **Run the checks locally:**
   ```bash
   npm run check   # lint + typecheck + tests
   ```
5. **Don't add user data to `captureError`.** Sentry is for technical context only — see the PII scrubber in `lib/sentry.ts`.
6. **Update tests** when changing logic in `lib/`. Pure functions get unit tests in `lib/__tests__/`.
7. **Open the PR**, fill out the template, and CI will run automatically.

## Local setup

```bash
# 1. Use the right Node version (project ships an .nvmrc file)
nvm use

# 2. Install dependencies
npm install
cd website && npm install && cd ..

# 3. Configure Sentry (optional for local dev)
cp .env.example .env
# fill in EXPO_PUBLIC_SENTRY_DSN if you want crash reporting

# 4. Start the app
npx expo start

# 5. Or start the marketing site
cd website && npm run dev
```

See [`docs/AI_CONTEXT.md`](./docs/AI_CONTEXT.md) for the full architecture overview.

## What gets accepted

- **Bug fixes** — almost always, especially with reproduction steps and tests
- **Documentation improvements** — yes, please
- **Privacy / security improvements** — high priority
- **New features** — case-by-case, depending on alignment with the product vision (calm, private, gradual reduction). Please discuss in an issue first.

## What probably won't get accepted

- Tracking, analytics SDKs, or anything that sends user data off-device
- Subscription billing or in-app purchases
- Features that turn the app into a generic habit tracker (it's deliberately specific to nicotine reduction)
- Major design system overrides — the IAMJARL tokens are the source of truth

## Reviews and timing

I aim to respond within a week, often faster. Sometimes life takes precedence — this is a side project. Please be patient and feel free to ping the issue if it's been silent for a fortnight.

## Code of conduct

Be kind. Assume good faith. The reduction journey is hard, the development of an app to help with that is also hard. Let's keep this a place where both can happen with dignity.
