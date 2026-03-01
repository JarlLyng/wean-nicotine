# App Store metadata — Taper! (copy/paste)

Brug felterne nedenfor i App Store Connect. Screenshots tilføjer du selv under **Previews and Screenshots** → **Phone** (kun iPhone; appen er iPhone-only).

---

## App Information (General)

### Subtitle (max 30 tegn)
```
Reduce nicotine at your pace
```

Alternativer hvis du foretrækker anden vinkel:
- `Taper snus & nicotine daily`
- `Track & reduce nicotine use`

---

## iOS App Version 1.0 — Distribution

### Promotional Text (valgfrit, max 170 tegn)
Kan ændres uden ny version. Fx:
```
Track your daily nicotine use, set a taper plan, and build lasting habits. No shame—just progress. Data stays on your device.
```

### Description (fuld beskrivelse, SEO-optimeret)

**Første 1–2 sætninger** vises i søgeresultater — hold dem klare og med nøgleord.

```
Taper helps you reduce nicotine use step by step—whether you use snus, pouches, or similar products. Set your own pace, log your daily use, and see your progress over time. All data stays on your device.

HOW IT WORKS
• Set a baseline and weekly reduction goal
• Log pouches used and cravings resisted each day
• Track progress with a simple weekly view and milestones
• Use built-in tools: breathing exercises, urge surfing, and reflection prompts

FOR YOU
Taper is for anyone who wants to cut down gradually without judgment. You choose the speed. The app keeps you honest and motivated with clear numbers and optional daily check-ins.

PRIVACY
Your data is stored only on your phone. We use crash reporting (Sentry) in production to fix bugs—no tracking, no ads, no selling data.

This app is for harm reduction and personal tracking only. It is not a substitute for medical advice. If you have health concerns, please consult a healthcare provider.
```

### Keywords (max 100 tegn inkl. kommaer — ingen mellemrum efter komma)

App Store søger på disse. Ingen gentagelse af app-navn.

```
nicotine,snus,taper,quit,reduce,cessation,habit,tracking,pouches,progress,velvære,sundhed,nikotin,trappe
```

Alternativ (mere engelsk fokus):
```
nicotine,snus,taper,quit,reduce,cessation,habit,tracking,pouches,daily,progress,health,wean
```

### Support URL
```
https://taper.iamjarl.com/support
```
(Hvis du bruger taper.dk: `https://www.taper.dk/support`)

### Marketing URL
```
https://taper.iamjarl.com/
```
(Hvis du bruger taper.dk: `https://taper.dk`)

### Copyright
```
2024 Jarl Lyng
```
(Opdater år efter behov.)

---

## App Privacy — VIGTIGT (Sentry)

Appen sender **crash- og fejldata** til Sentry i production for at forbedre appen. Det skal afspejles i App Privacy.

I App Store Connect → **App Privacy** → **Edit** (ved "Data Types"):

1. Vælg **"Data is collected from this app"** (ikke "Data Not Collected").
2. Tilføj følgende **Data Type**:
   - **Diagnostics** → **Crash Data**
     - Purpose: **App Functionality** (fx "We use crash data to fix bugs and improve stability.")
     - Linked to user: **No**
     - Used for tracking: **No**
3. (Valgfrit) Hvis du har performance/tracing slået til i Sentry:
   - **Diagnostics** → **Performance Data**
     - Same purpose/linking/tracking som ovenfor.

Detaljeret trin-for-trin står i `docs/PRIVACY_APP_STORE.md`.

---

## iPad og Apple Watch

**Appen er kun til iPhone.** I `app.json` er `ios.supportsTablet` sat til `false`, så buildet er iPhone-only.

- **Previews and Screenshots:** Der vises faner for Phone, iPad og Apple Watch — det er standard. **Udfyld kun "Phone"** med dine iPhone-screenshots. Lad iPad og Watch være tomme.
- **Pricing and Availability:** Hvis du **ikke** vil have appen tilgængelig på Apple Silicon Mac eller Apple Vision Pro, kan du under "iPhone and iPad Apps on Apple Silicon Macs" og "iPhone and iPad Apps on Apple Vision Pro" **fravælge** "Make this app available". Så vises den kun på iPhone (og evt. iPad i kompatibilitetstilstand, hvis Apple tillader det for din build — med `supportsTablet: false` er den ikke målrettet iPad).

Kort: Du behøver ikke gøre noget ekstra for at den primært er en iPhone-app; udfyld kun Phone-screenshots og lad andre enheder være som de er, medmindre du eksplicit vil skjule Mac/Vision Pro.

---

## Kategori (allerede sat i dine screenshots)

- **Primary:** Health & Fitness  
- **Secondary:** Lifestyle  

Ingen ændring nødvendig.

---

## Checklist før Submit

- [ ] Subtitle opdateret (ikke "Reduce your blood pressure")
- [ ] Description og Keywords indsat
- [ ] Support URL og Marketing URL korrekte
- [ ] App Privacy opdateret med Sentry (Crash Data)
- [ ] Kun Phone-screenshots uploadet (du producerer selv)
- [ ] Build 1.0.0 (eller nyere) valgt under "Build"
