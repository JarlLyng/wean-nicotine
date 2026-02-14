# iOS review – anbefalinger

## Fund (prioriteret)

### Høj

- Push‑entitlement er tvunget til `production` for alle builds, hvilket kan gøre dev builds ubrugelige til APNs. Overvej at styre entitlements pr. build‑konfiguration.
- Privacy manifest er inkonsistent: pluginen kan overskrive `PrivacyInfo.xcprivacy` med færre API‑reasons end den fil der ligger i iOS‑mappen. Risiko for App Store‑afvisning.

### Mellem

- New Architecture er modstridende konfigureret på tværs af `app.json`, `Podfile.properties.json` og `Podfile`. Det kan give pods‑mismatch og cache‑problemer.
- Build‑nummer er ude af sync mellem Expo og iOS‑projektet. Risiko for afvisning ved næste release.

### Lav

- `LSMinimumSystemVersion` er 12.0 i Info.plist, mens deployment target er 15.1. Det giver forvirrende metadata.
- `.xcode.env.local` er committed med maskespecifik Node‑sti og bør ikke ligge i repoet.
- `CODE_SIGN_IDENTITY` er sat til "iPhone Developer" også for Release, hvilket kan kollidere med distribution‑signing.

## Konkrete anbefalinger

1. Gør `aps-environment` dynamisk pr. build (Debug = development, Release = production), fx via en config‑plugin der læser `EXPO_CONFIGURATION`.
2. Gør privacy manifest deterministisk: enten generér det fuldt i pluginen eller stop generering og commit den rigtige fil i `ios/`.
3. Vælg én sandhedskilde for New Architecture (Expo config eller iOS), og align alle steder.
4. Sync `buildNumber` med `CFBundleVersion` og `CURRENT_PROJECT_VERSION` før næste release.
5. Fjern `LSMinimumSystemVersion` fra Info.plist eller sæt den til 15.1.
6. Fjern `ios/.xcode.env.local` fra git og sørg for at den kun ligger lokalt.
7. Tjek Release‑signing: brug "Apple Distribution"/Automatic signing hvis I bygger lokalt.

## Åbne spørgsmål

- Skal iOS‑mappen være committed, eller bruges “prebuild‑flow” hvor iOS genereres?
- Skal push‑notifikationer fungere i dev‑klienter/simulator‑builds?
- Er de ekstra privacy‑reasons (DiskSpace/SystemBootTime) faktisk nødvendige pga. SDK’er?

## Tests

- Ikke kørt. Ingen iOS build/test udført.
