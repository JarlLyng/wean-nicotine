# Release Checklist — Taper

Dette dokument indeholder alle opgaver der skal gennemføres før appen kan releases til App Store og Google Play.

---

## 🔧 Teknisk Setup

### EAS Build Konfiguration
- [ ] Opret `eas.json` med build profiler:
  - Development build (til testing)
  - Production build (til release)
  - iOS og Android konfigurationer
- [ ] Test EAS Build lokalt: `eas build --profile development --platform ios`
- [ ] Verificer at alle dependencies bygger korrekt

### Sentry Production Setup
- [ ] Opret EAS Secret for `EXPO_PUBLIC_SENTRY_DSN`:
  ```bash
  eas secret:create --scope project --name EXPO_PUBLIC_SENTRY_DSN --value "https://din-dsn@sentry.io/project-id" --type string
  ```
- [ ] Test at Sentry modtager events i production build
- [ ] Verificer at Sentry ikke sender events i development (kun console logs)

### Version & Build Numbers
- [ ] Opdater `version` i `app.json` (f.eks. "1.0.0")
- [ ] Tilføj iOS `buildNumber` i `app.json`:
  ```json
  "ios": {
    "buildNumber": "1"
  }
  ```
- [ ] Tilføj Android `versionCode` i `app.json`:
  ```json
  "android": {
    "versionCode": 1
  }
  ```

---

## 🎨 Assets & Branding

### App Icon & Splash Screen
- [ ] Verificer at alle app ikoner er korrekte:
  - `assets/images/icon.png` (1024x1024)
  - `assets/images/android-icon-foreground.png`
  - `assets/images/android-icon-background.png`
  - `assets/images/android-icon-monochrome.png`
- [ ] Test splash screen på iOS og Android
- [ ] Verificer at splash screen farver matcher app tema

### App Store Screenshots
- [ ] Design og generer screenshots for iPhone (alle størrelser):
  - 6.7" Display (iPhone 14 Pro Max, etc.)
  - 6.5" Display (iPhone 11 Pro Max, etc.)
  - 5.5" Display (iPhone 8 Plus, etc.)
- [ ] Design og generer screenshots for iPad (hvis relevant)
- [ ] Design og generer screenshots for Android (alle størrelser)
- [ ] Screenshots skal vise: onboarding, home screen, progress screen, tools

---

## 📝 App Store Metadata

### iOS App Store Connect
- [ ] **App Navn**: "Taper" (eller valgfrit navn)
- [ ] **Subtitle**: Kort beskrivelse (30 tegn)
- [ ] **Beskrivelse**: 
  - Hvad er Taper?
  - Hvem er det for?
  - Hvordan virker det?
  - Hvad gør det anderledes?
- [ ] **Keywords**: snus, nicotine, taper, quit, reduce, pouches, etc.
- [ ] **Kategori**: Health & Fitness (eller relevant)
- [ ] **Privacy Policy URL**: (se næste sektion)
- [ ] **Support URL**: (hvis relevant)
- [ ] **Marketing URL**: (hvis relevant)
- [ ] **Age Rating**: Konfigurer baseret på indhold
- [ ] **App Preview Video**: (valgfrit, men anbefalet)

### Google Play Console
- [ ] **App Navn**: "Taper"
- [ ] **Kort beskrivelse**: (80 tegn)
- [ ] **Fuld beskrivelse**: Samme som iOS
- [ ] **App Icon**: 512x512 PNG
- [ ] **Feature Graphic**: 1024x500 PNG
- [ ] **Kategori**: Health & Fitness
- [ ] **Privacy Policy URL**: (se næste sektion)
- [ ] **Content Rating**: Konfigurer baseret på indhold

---

## 🔒 Privacy & Legal

### Privacy Policy
- [ ] Opret privacy policy side/website
- [ ] Beskriv:
  - Alle data gemmes lokalt på enheden
  - Ingen data sendes til servere (undtagen Sentry error tracking)
  - Ingen tracking eller analytics
  - Ingen tredjeparts services
  - Hvordan data kan slettes (via app)
- [ ] Host privacy policy (GitHub Pages, Netlify, eller lignende)
- [ ] Tilføj link til privacy policy i app settings (valgfrit)

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
  - [ ] Settings & reset taper
  - [ ] Notifications (hvis aktiveret)
- [ ] Test på forskellige iOS versioner (minimum iOS 13+)
- [ ] Test på forskellige enheder (iPhone, iPad)

### Google Play Internal Testing (Android)
- [ ] Byg production build: `eas build --profile production --platform android`
- [ ] Upload til Google Play Internal Testing
- [ ] Inviter testers
- [ ] Test alle flows (samme som iOS)
- [ ] Test på forskellige Android versioner (minimum Android 8+)
- [ ] Test på forskellige enheder

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
  - [ ] Reset taper fungerer
  - [ ] Notifications kan aktiveres/deaktiveres
- [ ] **Tools**:
  - [ ] Alle tools åbner korrekt
  - [ ] Breathing exercise fungerer
  - [ ] Urge surfing vises
  - [ ] Reflection prompts fungerer

### Edge Cases & Error Handling
- [ ] Test med ingen internetforbindelse
- [ ] Test med fuld database (mange log entries)
- [ ] Test reset taper efter lang tids brug
- [ ] Test onboarding efter reset
- [ ] Verificer at alle error states håndteres gracefully
- [ ] Test med gamle data (hvis opgradering fra tidligere version)

### Performance Testing
- [ ] Test app start tid (< 2 sekunder)
- [ ] Test navigation hastighed
- [ ] Test database queries (ikke for langsomme)
- [ ] Test med mange log entries (100+)
- [ ] Test memory usage (ikke memory leaks)

### Accessibility Testing
- [ ] Test med VoiceOver (iOS) / TalkBack (Android)
- [ ] Test med Dynamic Type (store tekststørrelser)
- [ ] Verificer kontrast ratios (WCAG AA minimum)
- [ ] Test med farveblindhed simulators
- [ ] Test touch target størrelser (minimum 44x44 points)

---

## 🧹 Code Cleanup

### Console Logs
- [ ] Fjern eller kommenter ud alle `console.log` statements
- [ ] Behold kun kritiske error logs
- [ ] Overvej at bruge Sentry for error logging i stedet

### Code Quality
- [ ] Kør `npm run lint` og fix alle warnings/errors
- [ ] Verificer at der ikke er unused imports
- [ ] Verificer at der ikke er unused variables
- [ ] Check for TypeScript errors: `npx tsc --noEmit`

### Documentation
- [ ] Opdater README.md med release information
- [ ] Verificer at alle kommentarer i koden er korrekte
- [ ] Opdater ROADMAP.md med completed phases

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
- [ ] Opret app i App Store Connect
- [ ] Upload build via EAS Submit eller manuelt
- [ ] Udfyld alle metadata felter
- [ ] Upload screenshots
- [ ] Konfigurer pricing (gratis)
- [ ] Submit for review
- [ ] Vente på review (typisk 1-3 dage)

### Google Play
- [ ] Opret app i Google Play Console
- [ ] Upload build via EAS Submit eller manuelt
- [ ] Udfyld alle metadata felter
- [ ] Upload screenshots og feature graphic
- [ ] Konfigurer pricing (gratis)
- [ ] Submit for review
- [ ] Vente på review (typisk 1-7 dage)

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
- [ ] App fungerer på både iOS og Android
- [ ] Alle flows er testet
- [ ] Error handling er på plads

---

## 📝 Noter

Tilføj noter her undervejs:

- 
- 
- 

---

**God release! 🎉**
