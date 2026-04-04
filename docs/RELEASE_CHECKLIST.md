# Release Checklist — Taper (iPhone / iOS v1.2)

Purpose:
- Operational release checklist for shipping the iOS app

Audience:
- Maintainers preparing TestFlight or App Store releases
- LLMs assisting with release coordination

Source of truth:
- Build configuration in `app.json`, `app.config.js`, `eas.json`, and App Store Connect
- Product/runtime behavior in code, not this checklist

Related files:
- [`README.md`](../README.md)
- [`docs/SENTRY.md`](./SENTRY.md)
- [`docs/APP_STORE_METADATA.md`](./APP_STORE_METADATA.md)
- [`docs/PRIVACY_APP_STORE.md`](./PRIVACY_APP_STORE.md)

Update when:
- Build or submission workflow changes
- Apple submission requirements change
- Release dependencies or operational steps change

Dette dokument er en praktisk checklist til **iOS release v1.2 (iPhone-only)**.
Android + iPad kan komme senere.

---

## 🔧 Teknisk Setup

### Build & upload (foretrukket: EAS lokalt build → IPA → Transporter)
- [ ] **Build-nummer:** I `app.json` skal `ios.buildNumber` være **større** end sidst uploadet til App Store Connect (fx 3, 4, 5 …). Opdater før hvert nyt build.
- [ ] **EAS Secret (Sentry):** `eas env:create --name EXPO_PUBLIC_SENTRY_DSN --value "https://..." --environment production --visibility plaintext`
- [ ] **Lokalt build:** Fra projektroden: `npx eas build --profile production --platform ios --local` → IPA produceres på din Mac.
- [ ] **Upload:** Brug **Transporter** (Mac) til at uploade IPA til App Store Connect.

**Alternativ:** Kun Xcode: åbn `ios/Taper.xcworkspace` → Product → Archive → Export/Upload. Eller EAS sky-build uden `--local`, derefter download IPA og Transporter.

### Sentry Production Setup
- [ ] Opret EAS Secret for `EXPO_PUBLIC_SENTRY_DSN` (production). Ved lokalt build: eksporter DSN i shell før build (se `docs/SENTRY.md`).
- [x] Sentry sender ikke events i `__DEV__` (kun console logs).
- [ ] Verificer i Sentry-projektet at events ankommer når der sker fejl i appen (TestFlight/production).

### Version & Build Numbers
- [x] Version i `app.json`: "1.2.0" (bruger-synlig; opdateret fra 1.1.0).
- [x] `ios.buildNumber` i `app.json`: "12" (com.iamjarl.taper) – skal inkrementeres før hvert nyt upload.
- [x] `eas.json`: `cli.appVersionSource`: "local" (version/build fra app.json).

---

## 🎨 Assets & Branding

### App Icon & Splash Screen
- [x] Verificer at app icon + assets er korrekte:
  - `assets/images/ios-light.png` osv. (understøtter mørk/tonet)
- [x] Test splash screen på iOS
- [x] Verificer at splash screen farver matcher app tema

### App Store Screenshots
- [ ] Design og generer screenshots for **iPhone kun** (appen er iPhone-only, `supportsTablet: false`):
  - Under "Previews and Screenshots" i App Store Connect udfyld kun **Phone**-fanen (lad iPad og Watch være tomme)
  - 6.7" Display (iPhone 14 Pro Max, etc.)
  - 6.5" Display (iPhone 11 Pro Max, etc.)
  - 5.5" Display (iPhone 8 Plus, etc.)
- [ ] Screenshots skal vise: onboarding, home screen, progress screen, tools

---

## 📝 App Store Metadata

### iOS App Store Connect
- [x] **App Navn**: "Taper!" (App Store listing; "Taper" var optaget)
- [x] App oprettet i App Store Connect med Bundle ID `com.iamjarl.taper`
- [ ] **Subtitle**: Kort beskrivelse (30 tegn) — **se [`docs/APP_STORE_METADATA.md`](./APP_STORE_METADATA.md)** (copy/paste; ikke "Reduce your blood pressure")
- [ ] **Beskrivelse**: Færdig tekst i [`docs/APP_STORE_METADATA.md`](./APP_STORE_METADATA.md) (SEO, disclaimer)
- [ ] **Keywords**: Se [`docs/APP_STORE_METADATA.md`](./APP_STORE_METADATA.md) (max 100 tegn)
- [x] **Kategori**: Health & Fitness (Primary), Lifestyle (Secondary)
- [x] **Privacy Policy URL**: `https://taper.iamjarl.com/privacy/`
- [ ] **App Privacy**: Opdater til "Data is collected" + Diagnostics → Crash Data (Sentry) — **se [`docs/PRIVACY_APP_STORE.md`](./PRIVACY_APP_STORE.md)**
- [ ] **Support URL**: `https://taper.iamjarl.com/support` (eller `https://www.taper.dk/support`)
- [ ] **Marketing URL**: `https://taper.iamjarl.com/` (eller `https://taper.dk`)
- [ ] **Age Rating**: Konfigurer baseret på indhold
- [ ] **App Preview Video**: (valgfrit, men anbefalet)
 
> Android release er ikke i scope for v1.1 (iPhone-only).

**iPad / Watch / Mac / Vision Pro:** Appen er bygget som iPhone-only (`ios.supportsTablet: false`). I App Store Connect vises stadig faner for iPad og Apple Watch under Previews — udfyld kun **Phone**. Hvis du ikke vil tilbyde appen på Apple Silicon Mac eller Apple Vision Pro, kan du under **Pricing and Availability** fravælge "Make this app available" for Mac og Vision Pro.

---

## 🔒 Privacy & Legal

### Privacy Policy
- [x] Opret privacy policy side/website
- [ ] Beskriv:
  - Alle data gemmes lokalt på enheden
  - **Sentry:** crash/fejldata sendes i production for at forbedre appen (ingen tracking/salg) — se [`docs/PRIVACY_APP_STORE.md`](./PRIVACY_APP_STORE.md)
  - Ingen tracking (evt. lokal statistik tæller kun på device)
  - Hvordan data kan slettes (via "Start Over" i appen)
- [x] Host privacy policy (GitHub Pages, Netlify, eller lignende)
- [x] Link: `https://taper.iamjarl.com/privacy/`
- [ ] (Valgfrit) Tilføj link til privacy policy i appen

### Terms of Service
- [ ] Overvej om Terms of Service er nødvendig
- [ ] Hvis ja, opret og host dem

---

## 🧪 Testing

### TestFlight (iOS)
- [ ] Byg production build lokalt (Xcode Archive → IPA) eller via EAS
- [ ] Upload IPA til App Store Connect via Transporter (eller EAS Submit)
- [ ] Inviter testers (interne og eksterne)
- [ ] Test alle flows:
  - [ ] Onboarding (ny bruger)
  - [ ] Daily logging (pouches brugt)
  - [ ] Progress tracking
  - [ ] Settings & Start Over
  - [ ] Notifications (hvis aktiveret)
- [ ] Test på forskellige iOS versioner (vælg minimum efter Expo/React Native support)
- [ ] Test på mindst 2 iPhone størrelser (lille + stor)

### Functional Testing
- [ ] **Onboarding Flow**:
  - [ ] Alle skridt fungerer
  - [ ] Data gemmes korrekt
  - [ ] Navigation virker
- [ ] **Home Screen**:
  - [ ] Daily allowance vises korrekt
  - [ ] Logging fungerer (pouches brugt, cravings resisted)
  - [ ] Progress ring opdateres
  - [ ] Data persisterer efter app restart
- [ ] **Progress Screen**:
  - [ ] Weekly progress vises korrekt
  - [ ] Milestones vises
  - [ ] Money saved beregnes korrekt
- [ ] **Settings**:
  - [ ] Start Over fungerer
  - [ ] Notifications kan aktiveres/deaktiveres
- [ ] **Tools**:
  - [ ] Alle tools åbner korrekt
  - [ ] Breathing exercise fungerer
  - [ ] Urge surfing vises
  - [ ] Reflection prompts fungerer

### Edge Cases & Error Handling
- [ ] Test med ingen internetforbindelse
- [ ] Test med fuld database (mange log entries)
- [ ] Test Start Over efter lang tids brug
- [ ] Test onboarding efter Start Over
- [ ] Verificer at alle error states håndteres gracefully
- [ ] Test med gamle data (hvis opgradering fra tidligere version)

### Performance Testing
- [ ] Test app start tid (< 2 sekunder)
- [ ] Test navigation hastighed
- [ ] Test database queries (ikke for langsomme)
- [ ] Test med mange log entries (100+)
- [ ] Test memory usage (ikke memory leaks)

### Accessibility Testing
- [ ] Test med VoiceOver (iOS)
- [ ] Test med Dynamic Type (store tekststørrelser)
- [ ] Verificer kontrast ratios (WCAG AA minimum)
- [ ] Test med farveblindhed simulators
- [ ] Test touch target størrelser (minimum 44x44 points)

---

## 🧹 Code Cleanup

### Console Logs
- [x] Fjern eller kommenter ud alle `console.log` statements (pakket ind i `__DEV__`)
- [x] Behold kun kritiske error logs
- [x] Overvej at bruge Sentry for error logging i stedet

### Code Quality
- [x] Kør `npm run lint` og fix alle warnings/errors
- [x] Verificer at der ikke er unused imports
- [x] Verificer at der ikke er unused variables
- [x] Check for TypeScript errors: `npx tsc --noEmit`

### Documentation
- [x] Opdater README.md med release information
- [x] Verificer at alle kommentarer i koden er korrekte
- [x] Opdater ROADMAP.md med completed phases

---

## 📊 Monitoring & Analytics

### Sentry Setup
- [ ] EAS Secret sat: `EXPO_PUBLIC_SENTRY_DSN` for production (se [`docs/SENTRY.md`](./SENTRY.md))
- [ ] Verificer at events ankommer i Sentry ved fejl i production/TestFlight
- [ ] Konfigurer alerts i Sentry (valgfrit)

### App Performance
- [ ] Overvåg app crashes i Sentry
- [ ] Overvåg performance metrics
- [ ] Sæt op notifications for kritiske errors

---

## 🚀 Submission

### iOS App Store
- [x] Opret app i App Store Connect
- [ ] Upload build: IPA via **Transporter** (foretrukket) eller EAS Submit
- [ ] Udfyld alle metadata felter (beskrivelse, keywords, screenshots)
- [ ] Upload screenshots
- [ ] Konfigurer pricing (gratis)
- [ ] Submit for review
- [ ] Vente på review (typisk 1-3 dage)

---

## 📋 Post-Release

### Monitoring
- [ ] Overvåg Sentry for errors første uge
- [ ] Overvåg app store reviews
- [ ] Forbered svar på almindelige spørgsmål

### Updates
- [ ] Forbered hotfix process (hvis nødvendigt)
- [ ] Planlæg første update (bug fixes, forbedringer)

---

## ✅ Final Checklist

Før du submitter, verificer:

- [ ] Alle tests er bestået
- [ ] Alle assets er korrekte
- [ ] Privacy policy er tilgængelig
- [ ] Sentry er konfigureret
- [ ] Version numbers er korrekte
- [ ] Console kun i __DEV__ (ingen i production)
- [ ] Code quality er god
- [ ] App fungerer på iPhone (iOS)
- [ ] Alle flows er testet
- [ ] Error handling er på plads

---

## 📝 Noter

Tilføj noter her undervejs:

- 
- 
- 

---

**God release!**
