# Security Policy

## Reporting a vulnerability

If you discover a security issue in Wean Nicotine — the iOS app or the
marketing site — please report it privately so we can fix it before
public disclosure.

**Preferred channel:** email <support@iamjarl.com> with the subject line
`Security: Wean Nicotine`.

Please include:

- A description of the issue and where you found it (app, website, repo).
- Steps to reproduce, if applicable.
- Your assessment of impact (data exposure, denial of service, etc.).
- Whether you'd like to be credited when the fix ships.

We aim to acknowledge within 72 hours and to ship a fix or mitigation
within a reasonable window depending on severity. We treat user privacy
as a release-blocker.

## What is in scope

- The iOS app (`com.iamjarl.taper`)
- The marketing website at <https://weannicotine.iamjarl.com>
- Build, deployment, and infrastructure that supports either of the above

## What is out of scope

- Vulnerabilities in third-party services we use (Sentry, Apple App Store,
  Umami, GitHub Pages) — please report those directly to the vendor.
- Issues that require physical access to the device.
- Self-inflicted attacks, e.g. side-loading a modified IPA.

## Privacy & data handling

Our public privacy commitments are documented at
<https://weannicotine.iamjarl.com/privacy/> and in
[`docs/PRIVACY_APP_STORE.md`](docs/PRIVACY_APP_STORE.md). If you find a
gap between what we promise and what the app actually does, that counts
as a security issue and we want to know.

Thanks for helping keep this project trustworthy.
