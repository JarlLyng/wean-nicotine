# Release Checklist — Taper (iPhone / iOS v1.0)

Dette dokument er en praktisk checklist til **første iOS release (iPhone-only)**.
Android + iPad kan komme senere.

---

## 🔧 Teknisk Setup

### EAS Build Konfiguration
- [x] Opret `eas.json` med build profiler (iOS): development, preview, production
- [x] Log ind i EAS: `eas login`
- [x] Første production iOS build: `eas build --profile production --platform ios`
- [x] Submit til App Store Connect: `eas submit --platform ios --latest`
- [ ] (Valgfrit) Første development build: `eas build --profile development --platform ios`

### Sentry Production Setup
- [x] Opret EAS Secret for `EXPO_PUBLIC_SENTRY_DSN`
- [x] Verificer at Sentry ikke sender events i `__DEV__` (kun console logs)
- [ ] Test at Sentry modtager events i en production/TestFlight build (kræver Apple Developer Account)

### Version & Build Numbers
- [x] Version i `app.json`: "1.0.0"
- [x] iOS `buildNumber` og `bundleIdentifier` i `app.json` (com.iamjarl.taper)

---

## 🎨 Assets & Branding

### App Icon & Splash Screen
- [x] Verificer at app icon + assets er korrekte:
  - `assets/images/ios-light.png` osv. (understøtter mørk/tonet)
- [x] Test splash screen på iOS
- [x] Verificer at splash screen farver matcher app tema

### App Store Screenshots
- [ ] Design og generer screenshots for iPhone (App Store Connect krav):
  - 6.7" Display (iPhone 14 Pro Max, etc.)
  - 6.5" Display (iPhone 11 Pro Max, etc.)
  - 5.5" Display (iPhone 8 Plus, etc.)
- [ ] Screenshots skal vise: onboarding, home screen, progress screen, tools

---

## 📝 App Store Metadata

### iOS App Store Connect
- [x] **App Navn**: "Taper!" (App Store listing; "Taper" var optaget)
- [x] App oprettet i App Store Connect med Bundle ID `com.iamjarl.taper`
- [ ] **Subtitle**: Kort beskrivelse (30 tegn)
- [ ] **Beskrivelse**: 
  - Hvad er Taper?
  - Hvem er det for?
  - Hvordan virker det?
  - Hvad gør det anderledes?
- [ ] **Keywords**: snus, nicotine, taper, quit, reduce, pouches, etc.
- [ ] **Kategori**: Health & Fitness (eller relevant)
- [x] **Privacy Policy URL**: `https://taper.iamjarl.com/privacy/`
- [ ] **Support URL**: `https://taper.iamjarl.com/support`
- [ ] **Marketing URL**: `https://taper.iamjarl.com/`
- [ ] **Age Rating**: Konfigurer baseret på indhold
- [ ] **App Preview Video**: (valgfrit, men anbefalet)
 
> Android release er ikke i scope for v1.0 (iPhone-only).

---

## 🔒 Privacy & Legal

### Privacy Policy
- [x] Opret privacy policy side/website
- [ ] Beskriv:
  - Alle data gemmes lokalt på enheden
  - Ingen data sendes til servere (undtagen Sentry error tracking)
  - Ingen tracking (evt. lokal statistik tæller kun på device)
  - Ingen tredjeparts services
  - Hvordan data kan slettes (via app)
- [x] Host privacy policy (GitHub Pages, Netlify, eller lignende)
- [x] Link: `https://taper.iamjarl.com/privacy/`
- [ ] (Valgfrit) Tilføj link til privacy policy i appen

### Terms of Service
- [ ] Overvej om Terms of Service er nødvendig
- [ ] Hvis ja, opret og host dem

---

## 🧪 Testing

### TestFlight (iOS)
- [ ] Byg production build: `eas build --profile production --platform ios`
- [ ] Upload til TestFlight
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
- [ ] Verificer at Sentry er konfigureret korrekt
- [ ] Test error tracking (throw en test error)
- [ ] Verificer at breadcrumbs logges
- [ ] Konfigurer alerts i Sentry (valgfrit)

### App Performance
- [ ] Overvåg app crashes i Sentry
- [ ] Overvåg performance metrics
- [ ] Sæt op notifications for kritiske errors

---

## 🚀 Submission

### iOS App Store
- [x] Opret app i App Store Connect
- [x] Upload build via EAS Submit (`eas submit --platform ios --latest`)
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
- [ ] Console logs er fjernet
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
