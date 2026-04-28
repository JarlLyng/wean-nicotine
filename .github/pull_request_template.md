<!--
Pull request template for Wean Nicotine.

Keep PRs small and focused. If a change touches both the app and the
website, consider splitting unless the changes are tightly coupled.
-->

## Summary

<!-- One or two sentences explaining what this PR does and why. -->

## Type of change

- [ ] Bug fix
- [ ] New feature
- [ ] Refactor (no behaviour change)
- [ ] Documentation
- [ ] Build / CI / tooling
- [ ] Privacy / security

## Linked issues

<!-- e.g. "Closes #123" or "Refs #456" -->

## Verification

- [ ] `npm test` passes
- [ ] `npx tsc --noEmit` passes
- [ ] `npx expo lint` passes (or website build if website-only)
- [ ] If touching `lib/sentry.ts` or any `captureError` call: confirmed no user data leaks (see `docs/SENTRY.md` privacy hardening section)
- [ ] If touching public copy: privacy claims still match runtime

## Screenshots / recordings

<!-- For UI changes, drop a before/after screenshot or screen recording. -->

## Notes for reviewer

<!-- Anything reviewers should focus on, or context they'd otherwise miss. -->
