# App Store metadata — Wean Nicotine (copy/paste)

Purpose:
- Canonical copy bank for App Store Connect metadata fields

Audience:
- Maintainers preparing App Store submissions
- LLMs helping with release or metadata workflows

Source of truth:
- App Store Connect is the final published state
- Product positioning should stay aligned with [`AI_CONTEXT.md`](./AI_CONTEXT.md) and [`SEO_STRATEGY.md`](./SEO_STRATEGY.md)

Related files:
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
- `Wean off snus & nicotine daily`
- `Track & reduce nicotine use`

---

## iOS App Version 1.3 — Distribution (submitted 2026-04-24)

### Promotional Text (valgfrit, max 170 tegn)
Kan ændres uden ny version:
```
Pick your own taper pace. Edit your plan anytime. Undo accidental logs. All data stays on your iPhone — no cloud, no accounts, no subscriptions.
```

### What's New (v1.3)
```
• Pick your own taper pace during onboarding — 3%, 5%, 7%, 10%, or 15% weekly reduction
• Edit your plan anytime from Settings — change baseline, pace, or price without losing your log history
• Undo accidental pouch logs within 5 seconds of tapping
• Smoother animations and under-the-hood improvements
```

### Description (fuld beskrivelse, SEO-optimeret)

**Første 1–2 sætninger** vises i søgeresultater — hold dem klare og med nøgleord.

```
Wean Nicotine helps you reduce nicotine use step by step—whether you use snus, pouches, or similar products. Set your baseline, log your daily use, and follow a gradual weekly reduction. All data stays on your device.

HOW IT WORKS
• Set your baseline daily use during onboarding
• Choose your weekly reduction pace (3% to 15%, default 5%)
• Log pouches used and cravings resisted each day with one tap
• Undo accidental logs in the 5-second window after tapping
• Edit your plan anytime from Settings — change baseline or pace without losing history
• See your daily usage in a weekly bar chart with trend tracking
• Earn milestone badges as you hit new goals
• Use built-in tools: breathing exercises, urge surfing, and reflection prompts

WHAT'S NEW IN 1.3
• Choose your own taper pace during onboarding — 3%, 5%, 7%, 10%, or 15% weekly reduction
• Edit your plan anytime from Settings — adjust baseline, pace, or price without losing your log history
• Undo pouch logging with a 5-second toast after every tap
• Quality-of-life improvements under the hood for a smoother experience

FOR YOU
Wean Nicotine is for anyone who wants to cut down gradually without judgment. You choose the speed. The app keeps you honest and motivated with clear numbers and optional daily check-ins.

PRIVACY
Your data is stored only on your phone. We use crash reporting (Sentry) in production to fix bugs—no tracking, no ads, no selling data.

This app is for harm reduction and personal tracking only. It is not a substitute for medical advice. If you have health concerns, please consult a healthcare provider.
```

### Keywords (max 100 tegn inkl. kommaer — ingen mellemrum efter komma)

```
nicotine,snus,wean,quit,reduce,cessation,habit,tracking,pouches,progress,velvære,sundhed,nikotin,trappe
```

Alternativ (mere engelsk fokus):
```
nicotine,snus,wean,quit,reduce,cessation,habit,tracking,pouches,daily,progress,health,taper
```

### Support URL
```
https://weannicotine.iamjarl.com/support
```

### Marketing URL
```
https://weannicotine.iamjarl.com/
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

## Localized Storefronts (submitted 2026-04-24)

Endelige tekster som er indsendt til App Store Connect for v1.3.0 på dansk, svensk og norsk.

### Danish (da-DK)

- **Subtitle:** `Skær ned på snus i dit tempo`
- **Promotional Text:** `Skær ned på snus og nikotinposer i dit eget tempo. Ret planen når som helst. Al data bliver på din iPhone — ingen konti, ingen abonnement.`
- **Keywords:** `snus,nikotin,nedtrapning,stoppe,afvænning,trang,nikotinposer,trappe,sundhed,velvære,sporing,vane`

**Description:**
```
Wean Nicotine hjælper dig med at skære ned på snus og nikotinposer i dit eget tempo. Angiv dit udgangspunkt, vælg dit ugentlige tempo, og lad appen guide dig skridt for skridt. Al data bliver på din iPhone.

SÅDAN FUNGERER DET
• Angiv dit nuværende daglige forbrug under onboarding
• Vælg dit ugentlige nedtrapningstempo — 3 % til 15 %, standard 5 %
• Log hver pose med ét tryk — tager under 2 sekunder
• Fortryd en fejlregistrering inden for 5 sekunder
• Ret din plan når som helst i Indstillinger uden at miste historik
• Se dit daglige forbrug i en ugentlig graf med tendenssporing
• Optjen milepæle når du når nye mål
• Brug indbyggede værktøjer: vejrtrækningsøvelser, urge surfing og refleksionslog

NYT I 1.3
• Vælg dit eget tempo under onboarding — 3, 5, 7, 10 eller 15 % ugentlig nedtrapning
• Ret din plan når som helst i Indstillinger — juster udgangspunkt, tempo eller pris uden at miste loghistorik
• Fortryd-knap i 5 sekunder efter hvert tryk
• Tekniske forbedringer for en mere flydende oplevelse

HVEM ER APPEN TIL
Wean Nicotine er til dig der vil skære ned gradvist uden løftede pegefingre. Du bestemmer tempoet. Appen holder dig ærlig og motiveret med klare tal og valgfri daglige påmindelser.

PRIVATLIV
Dine brugsdata gemmes lokalt på din iPhone. Appen kræver ingen konto og synkroniserer ikke til skyen. Anonyme fejlrapporter sendes via Sentry for at fikse bugs — ingen reklamer, ingen tracking, intet salg af data.

Denne app er til skadesreduktion og personlig tracking. Den erstatter ikke lægelig rådgivning. Har du bekymringer omkring dit helbred, så tal med din læge eller sundhedspersonale.
```

**What's New:**
```
• Vælg dit eget tempo under onboarding — 3, 5, 7, 10 eller 15 % ugentlig nedtrapning
• Ret din plan når som helst i Indstillinger — juster udgangspunkt, tempo eller pris uden at miste loghistorik
• Fortryd-knap i 5 sekunder efter hvert tryk
• Tekniske forbedringer for en mere flydende oplevelse
```

### Swedish (sv-SE)

- **Subtitle:** `Minska snuset i din takt`
- **Promotional Text:** `Minska snuset i din egen takt. Ändra planen när som helst. All data stannar på din iPhone — inga konton, ingen prenumeration.`
- **Keywords:** `snus,snusa,sluta,minska,nedtrappning,nikotin,prilla,portionssnus,vitsnus,nikotinpåsar,sug,hälsa`

**Description:**
```
Wean Nicotine hjälper dig att minska på snus och nikotinpåsar i din egen takt. Ange din baslinje, välj din veckovisa takt, och låt appen guida dig steg för steg. All data stannar på din iPhone.

SÅ HÄR FUNGERAR DET
• Ange din nuvarande dagliga användning under introduktionen
• Välj din veckovisa nedtrappningstakt — 3 % till 15 %, standard 5 %
• Logga varje prilla med ett tryck — tar under 2 sekunder
• Ångra en felaktig registrering inom 5 sekunder
• Ändra planen när som helst i Inställningar utan att förlora historik
• Se din dagliga användning i ett veckoschema med trendspårning
• Tjäna milstolpar när du når nya mål
• Använd inbyggda verktyg: andningsövningar, urge surfing och reflektionslogg

NYTT I 1.3
• Välj din egen takt under introduktionen — 3, 5, 7, 10 eller 15 % veckovis nedtrappning
• Ändra planen när som helst i Inställningar — justera baslinje, takt eller pris utan att förlora logghistoriken
• Ångra-knapp i 5 sekunder efter varje tryck
• Tekniska förbättringar för en smidigare upplevelse

VEM ÄR APPEN FÖR
Wean Nicotine är för dig som vill minska gradvis utan pekpinnar. Du bestämmer takten. Appen håller dig ärlig och motiverad med tydliga siffror och valfria dagliga påminnelser.

INTEGRITET
Din användningsdata lagras lokalt på din iPhone. Appen kräver inget konto och synkroniserar inte till molnet. Anonyma felrapporter skickas via Sentry för att fixa buggar — inga annonser, ingen spårning, ingen försäljning av data.

Den här appen är till för skadereducering och personlig tracking. Den ersätter inte medicinsk rådgivning. Har du hälsobekymmer, prata med din läkare eller vårdpersonal.
```

**What's New:**
```
• Välj din egen takt under introduktionen — 3, 5, 7, 10 eller 15 % veckovis nedtrappning
• Ändra planen när som helst i Inställningar — justera baslinje, takt eller pris utan att förlora logghistoriken
• Ångra-knapp i 5 sekunder efter varje tryck
• Tekniska förbättringar för en smidigare upplevelse
```

### Norwegian (no-NO)

- **Subtitle:** `Reduser snusbruken i ditt tempo`
- **Promotional Text:** `Reduser snusbruken i ditt eget tempo. Endre planen når som helst. All data blir på iPhonen din — ingen kontoer, ingen abonnement.`
- **Keywords:** `snus,snuse,slutte,redusere,nedtrapping,nikotin,nikotinposer,snusposer,sug,vane,helse,avvenning`

**Description:**
```
Wean Nicotine hjelper deg med å redusere snusbruken og nikotinposene i ditt eget tempo. Sett utgangspunktet, velg ditt ukentlige tempo, og la appen guide deg steg for steg. All data blir på iPhonen din.

SLIK FUNGERER DET
• Oppgi ditt nåværende daglige forbruk under introduksjonen
• Velg ditt ukentlige nedtrappingstempo — 3 % til 15 %, standard 5 %
• Logg hver pose med ett trykk — tar under 2 sekunder
• Angre en feillogging innen 5 sekunder
• Endre planen når som helst i Innstillinger uten å miste historikk
• Se ditt daglige forbruk i en ukentlig graf med trendsporing
• Tjen milepæler når du når nye mål
• Bruk innebygde verktøy: pusteøvelser, urge surfing og refleksjonslogg

NYTT I 1.3
• Velg ditt eget tempo under introduksjonen — 3, 5, 7, 10 eller 15 % ukentlig nedtrapping
• Endre planen når som helst i Innstillinger — juster utgangspunkt, tempo eller pris uten å miste logghistorikken
• Angre-knapp i 5 sekunder etter hvert trykk
• Tekniske forbedringer for en smidigere opplevelse

HVEM ER APPEN FOR
Wean Nicotine er for deg som vil redusere gradvis uten moralisering. Du bestemmer tempoet. Appen holder deg ærlig og motivert med klare tall og valgfrie daglige påminnelser.

PERSONVERN
Brukerdataene dine lagres lokalt på iPhonen din. Appen krever ingen konto og synkroniserer ikke til skyen. Anonyme feilrapporter sendes via Sentry for å fikse bugs — ingen annonser, ingen sporing, ingen salg av data.

Denne appen er til skadereduksjon og personlig sporing. Den erstatter ikke medisinsk rådgivning. Har du helsebekymringer, snakk med legen din eller helsepersonell.
```

**What's New:**
```
• Velg ditt eget tempo under introduksjonen — 3, 5, 7, 10 eller 15 % ukentlig nedtrapping
• Endre planen når som helst i Innstillinger — juster utgangspunkt, tempo eller pris uten å miste logghistorikken
• Angre-knapp i 5 sekunder etter hvert trykk
• Tekniske forbedringer for en smidigere opplevelse
```

---

## App Privacy

Se [`docs/PRIVACY_APP_STORE.md`](./PRIVACY_APP_STORE.md) for trin-for-trin opsætning af Sentry crash data i App Store Connect.
