# App Store metadata — Taper! (copy/paste)

Purpose:
- Canonical copy bank for App Store Connect metadata fields

Audience:
- Maintainers preparing App Store submissions
- LLMs helping with release or metadata workflows

Source of truth:
- App Store Connect is the final published state
- Product positioning should stay aligned with [`AI_CONTEXT.md`](./AI_CONTEXT.md) and [`SEO_STRATEGY.md`](./SEO_STRATEGY.md)

Related files:
- [`docs/RELEASE_CHECKLIST.md`](./RELEASE_CHECKLIST.md)
- [`docs/PRIVACY_APP_STORE.md`](./PRIVACY_APP_STORE.md)
- [`website/src/lib/site.ts`](../website/src/lib/site.ts)

Update when:
- App Store positioning changes
- Support, marketing, or privacy URLs change
- Apple metadata requirements change

Brug felterne nedenfor i App Store Connect. Screenshots tilføjer du selv under **Previews and Screenshots** → **Phone** (kun iPhone; appen er iPhone-only).

---

## App Information (General)

### Subtitle (max 30 tegn)
```
Reduce nicotine at your pace
```

Alternativer:
- `Taper snus & nicotine daily`
- `Track & reduce nicotine use`

---

## iOS App Version 1.2 — Distribution

### Promotional Text (valgfrit, max 170 tegn)
Kan ændres uden ny version:
```
Track your daily nicotine use, set a taper plan, and build lasting habits. No shame—just progress. Data stays on your device.
```

### What's New (v1.2)
```
• Enhanced Breathing Exercise: New patterns (4-7-8, Box, Quick Calm), duration selection, and rhythmic haptic feedback
• New Session Counter: Track your total breathing and mindfulness sessions
• Interactive Urge Surfing: Guided 5-minute timer with step-by-step instructions and "log as resisted" functionality
• Reflection Journal: Save your reflections as dated notes, view your history, and explore categorized prompts
• New Cost Savings Tool: See exactly how much you've saved based on your current pouch price (Weekly/Monthly breakdown)
• Performance improvements and minor bug fixes
```

### Description (fuld beskrivelse, SEO-optimeret)

**Første 1–2 sætninger** vises i søgeresultater — hold dem klare og med nøgleord.

```
Taper helps you reduce nicotine use step by step—whether you use snus, pouches, or similar products. Set your own pace, log your daily use, and see your progress over time. All data stays on your device.

HOW IT WORKS
• Set a baseline and weekly reduction goal
• Log pouches used and cravings resisted each day
• See your daily usage in a weekly bar chart with trend tracking
• Earn milestone badges as you hit new goals
• Use built-in tools: breathing exercises, urge surfing, and reflection prompts

WHAT'S NEW IN 1.2
• Advanced Breathing: Choose from 4-7-8, Box Breathing, or Quick Calm with immersive haptics
• Guided Urge Surfing: A 5-minute interactive wave rider to help you through the toughest cravings
• Reflection Journal: Keep a private log of your journey with dated entries and categories
• Cost Savings: Real-time calculation of money saved since your start date
• Native iOS experience with smooth navigation and haptics

FOR YOU
Taper is for anyone who wants to cut down gradually without judgment. You choose the speed. The app keeps you honest and motivated with clear numbers and optional daily check-ins.

PRIVACY
Your data is stored only on your phone. We use crash reporting (Sentry) in production to fix bugs—no tracking, no ads, no selling data.

This app is for harm reduction and personal tracking only. It is not a substitute for medical advice. If you have health concerns, please consult a healthcare provider.
```

### Keywords (max 100 tegn inkl. kommaer — ingen mellemrum efter komma)

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

### Marketing URL
```
https://taper.iamjarl.com/
```

### Copyright
```
2026 Jarl Lyng
```

---

## iPad og Apple Watch

Appen er kun til iPhone (`ios.supportsTablet: false`). Udfyld kun "Phone" med iPhone-screenshots. Lad iPad og Watch være tomme.

---

## Kategori

- **Primary:** Health & Fitness
- **Secondary:** Lifestyle

---

---

## Localized Storefronts (Scandinavia)

Follow the strategy in [`SEO_STRATEGY.md`](./SEO_STRATEGY.md) section 23. Translate the following fields in App Store Connect.

### Danish (da-DK)
- **Subtitle:** `Trap ned på snus i dit tempo`
- **Keywords:** `nikotin,snus,nedtrapning,stop,skærned,vane,sporing,poser,fremskridt,velvære,sundhed,nikotinpose`
- **Description:** 
```
Taper hjælper dig med at reducere dit nikotinforbrug skridt for skridt – uanset om du bruger snus, nikotinposer eller lignende produkter. Sæt dit eget tempo, registrer dit daglige forbrug, og se dine fremskridt over tid. Alle data bliver på din enhed.

SÅDAN FUNGERER DET
• Sæt et udgangspunkt og et ugentligt mål for nedtrapning
• Registrer brugte poser og modstået trang hver dag
• Se dit daglige forbrug i en ugentlig oversigt med tendenssporing
• Optjen medaljer efterhånden som du når nye mål
• Brug indbyggede værktøjer: vejrtrækningsøvelser, Urge Surfing og logbog

NYT I 1.2
• Avanceret vejrtrækning: Vælg mellem 4-7-8, Box Breathing eller Quick Calm
• Interaktiv Urge Surfing: En 5-minutters guidet timer der hjælper dig gennem trangen
• Refleksions-logbog: Gem dine tanker med datoer og se din historik
• Økonomisk overblik: Se præcis hvor meget du har sparet i kr. siden start
• Flottere animationer og mærkbar haptisk feedback
```

### Swedish (sv-SE)
- **Subtitle:** `Minska snuset i din takt`
- **Keywords:** `nikotin,snus,minska,sluta,nedtrappning,vana,spårning,prilla,framsteg,hälsa,portionssnus,vittsnus`
- **Description:**
```
Taper hjälper dig att minska på snusandet steg för steg – oavsett om du använder portionssnus, vitt snus eller liknande produkter. Sätt din egen takt, logga din dagliga användning och se dina framsteg över tid. All data stannar på din enhed.

HUR DET FUNGERAR
• Sätt en baslinje och ett veckovis mål för nedtrappning
• Logga använda prillor och hanterat sug varje dag
• Se din dagliga användning i ett veckoschema med trendspårning
• Tjäna medaljer när du når nya mål
• Använd inbyggda verktyg: andningsövningar och stöd för suget
```

### Norwegian (no-NO)
- **Subtitle:** `Trapp ned på snus i ditt tempo`
- **Keywords:** `nikotin,snus,nedtrapping,slutte,redusere,vane,logging,poser,fremgang,helse,nikotinposer,taper`
- **Description:**
```
Taper hjelper deg med å redusere snusbruk steg for steg – uanset om du bruker snus, nikotinposer eller lignende produkter. Sett ditt eget tempo, logg ditt daglige bruk, og se fremgangen over tid. Alle data blir på din enhed.

SLIK FUNGERER DET
• Sett et nullpunkt og et ukentlig mål for nedtrapping
• Logg brukte poser og motstått sug hver dag
• Se ditt daglige forbruk i en ukentlig oversikt med trendsporing
• Tjen medaljer etter hvert som du når nye mål
• Bruk innebygde verktøy: pusteøvelser og hjelp mot sug
```

---

## App Privacy

Se [`docs/PRIVACY_APP_STORE.md`](./PRIVACY_APP_STORE.md) for trin-for-trin opsætning af Sentry crash data i App Store Connect.
