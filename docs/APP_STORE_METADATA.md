# App Store metadata — Wean Nicotine (copy/paste)

Purpose:

- Canonical copy bank for App Store Connect metadata fields

Audience:

- Maintainers preparing App Store submissions
- LLMs helping with release or metadata workflows

Source of truth:

- App Store Connect is the final published state
- Product positioning should stay aligned with [`AI_CONTEXT.md`](./AI_CONTEXT.md). Marketing positioning, SEO/ASO playbooks, competitive analysis, and channel plans live in the private IAMJARL strategy hub (not in this public repo) — see `WeanNicotine/` in [JarlLyng/iamjarl-strategy](https://github.com/JarlLyng/iamjarl-strategy) (access-restricted).

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

## iOS App Version 1.6.1 — Live in App Store (build 23, approved July 2026)

Small patch: refreshed app icons, a privacy hardening (Sentry breadcrumb scrubbing), and the Progress legend layout fix. **ASO fields (subtitle + keywords) are unchanged from 1.6.0** and carry forward automatically — do not re-enter them. **Promotional Text must be re-pasted** (ASC wipes it on every new version); reuse the exact 1.6.0 per-locale promo texts above.

### What's New (v1.6.1)

**English:**

```
Polish and a privacy touch-up.

• Fixed a cramped label on the Progress screen
• Tightened crash reporting so nothing about your usage can ride along
• Refreshed app icon
```

**Danish:**

```
Finpudsning og en lille privatlivsforbedring.

• Rettet en klemt tekst på Fremskridt-skærmen
• Strammet crash-rapportering, så intet om dit forbrug kan følge med
• Opdateret app-ikon
```

**Swedish:**

```
Putsning och en liten integritetsförbättring.

• Åtgärdade en trång etikett på Framsteg-skärmen
• Skärpte kraschrapporteringen så inget om din användning följer med
• Uppdaterad appikon
```

**Norwegian:**

```
Finpuss og en liten personvernforbedring.

• Rettet en trang etikett på Fremgang-skjermen
• Strammet inn krasjrapportering så ingenting om bruken din blir med
• Oppdatert app-ikon
```

---

## iOS App Version 1.6.0 — Superseded by 1.6.1 (build 22, was live July 2026)

Small quality release that also carries the ASO metadata pass: new subtitles (SV + NO) and rebuilt keyword fields per locale, plus re-pasted Promotional Text (ASC wipes it on every new version). Release notes and promo text are written per the portfolio voice rules (no em-dashes; bullets are allowed on the store surface). Rationale for the keyword/subtitle choices lives in the private hub (`WeanNicotine/aso-pass-draft.md`).

### ASO fields shipped with 1.6.0 (final, as submitted)

**English** — subtitle kept (warm), taper/pouch moved into keywords:

- **Subtitle:** `Reduce snus at your pace` (unchanged)
- **Keywords:** `taper,pouch,zyn,velo,quit,stop,cut,down,gradual,tracker,cessation,tobacco,dip,chew,habit,craving`
- **Promotional Text:** `A gentler way to reduce nicotine pouches. No accounts, no cloud, no streak anxiety. Just your pace, your data, your phone.`

**Danish** — subtitle unchanged (already intent-matched):

- **Subtitle:** `Skær ned på snus i dit tempo` (unchanged)
- **Keywords:** `nedtrapning,trappe,nikotin,nikotinposer,stop,stoppe,afvænning,trang,poser,gradvis,mindre,tobak`
- **Promotional Text:** `En blidere måde at trappe ned for snus og nikotinposer. Ingen konto, ingen sky, ingen streak-angst. Bare dit tempo, dine data, din iPhone.`

**Swedish** — new query-matching subtitle:

- **Subtitle:** `Trappa ner snus i din takt` (was `Minska snuset i din takt`)
- **Keywords:** `sluta,snusa,minska,nedtrappning,nikotin,prilla,prillor,nikotinpåsar,vitt,sug,gradvis,tobak`
- **Promotional Text:** `Ett mildare sätt att minska snus och nikotinpåsar. Inget konto, inget moln, ingen streak-ångest. Bara din takt, dina data, din iPhone.`

**Norwegian** — new query-matching subtitle:

- **Subtitle:** `Trapp ned snus i ditt tempo` (was `Reduser snusbruken i ditt tempo`)
- **Keywords:** `slutte,snuse,redusere,nedtrapping,nikotin,nikotinposer,porsjon,sug,gradvis,tobakk,mindre,vane`
- **Promotional Text:** `En mildere måte å trappe ned snus og nikotinposer. Ingen konto, ingen sky, ingen streak-angst. Bare ditt tempo, dine data, din iPhone.`

### What's New (v1.6.0)

**English:**

```
A small, careful update.

• Pick your pace with confidence: setup now shows when you'd reach zero, before you commit
• Undo has twice the time: 10 seconds to take back a mistap
• Gentler wording when setting your starting point
• Fixed a rare case where reminders could be scheduled twice
• Small visual polish and reliability improvements
```

**Danish:**

```
En lille, omhyggelig opdatering.

• Vælg dit tempo med ro i maven: opsætningen viser nu, hvornår du rammer nul, før du beslutter dig
• Fortryd har dobbelt så lang tid: 10 sekunder til at tage et fejltryk tilbage
• Blidere formuleringer, når du sætter dit udgangspunkt
• Rettet et sjældent tilfælde, hvor påmindelser kunne blive planlagt dobbelt
• Små visuelle forbedringer og øget stabilitet
```

**Swedish:**

```
En liten, omsorgsfull uppdatering.

• Välj din takt med trygghet: introduktionen visar nu när du når noll, innan du bestämmer dig
• Ångra har dubbelt så lång tid: 10 sekunder att ta tillbaka ett feltryck
• Mjukare formuleringar när du anger din utgångspunkt
• Åtgärdat ett sällsynt fall där påminnelser kunde schemaläggas dubbelt
• Små visuella förbättringar och ökad stabilitet
```

**Norwegian:**

```
En liten, omtenksom oppdatering.

• Velg tempoet ditt med trygghet: introduksjonen viser nå når du når null, før du bestemmer deg
• Angre har dobbelt så lang tid: 10 sekunder til å ta tilbake et feiltrykk
• Mildere formuleringer når du setter utgangspunktet ditt
• Rettet et sjeldent tilfelle der påminnelser kunne bli planlagt dobbelt
• Små visuelle forbedringer og økt stabilitet
```

---

## iOS App Version 1.5.0 — Superseded by 1.6.0 (build 21, was live July 2026)

Feature release: usage-pattern insight, a whole-pouch daily target, a gentle pace suggestion, and a goal-reached celebration. Build 20 was superseded by build 21 before release to fold in refreshed app icons.

### Promotional Text (valgfrit, max 170 tegn)

Kan ændres uden ny version. Evergreen-versionerne fra 1.4.1-sektionen gælder stadig; nedenstående er release-specifikke rotationer for 1.5.0.

**English (release-specific):**

```
Now with usage patterns, a whole-pouch daily target, and a calm celebration when you reach your goal. Your pace, your data, your phone.
```

**Danish (release-specific):**

```
Nu med brugsmønstre, et dagligt mål i hele portioner og en rolig fejring når du når dit mål. Dit tempo, dine data, din iPhone.
```

**Swedish (release-specific):**

```
Nu med användningsmönster, ett dagligt mål i hela påsar och ett lugnt firande när du når ditt mål. Din takt, dina data, din iPhone.
```

**Norwegian (release-specific):**

```
Nå med bruksmønstre, et daglig mål i hele porsjoner og en rolig feiring når du når målet ditt. Ditt tempo, dine data, din iPhone.
```

### What's New (v1.5.0)

**English:**

```
See your patterns and reach your goal — calm and private as ever.

• Tag what set off a pouch — one optional tap, never required
• New Patterns view: your toughest times of day and most common triggers
• Your daily target now shows whole pouches, not decimals
• A gentle nudge if your pace looks too fast — ease it anytime
• A quiet celebration the day you reach your goal
• Refreshed app icon
• Fixes and reliability improvements behind the scenes
```

**Danish:**

```
Se dine mønstre og nå dit mål — roligt og privat som altid.

• Tag hvad der udløste en portion — ét valgfrit tryk, aldrig krævet
• Nyt Mønstre-overblik: dine sværeste tidspunkter og hyppigste triggere
• Dit daglige mål vises nu i hele portioner, ikke decimaler
• Et blidt vink hvis dit tempo ser for hurtigt ud — sæt det ned når som helst
• En rolig fejring den dag du når dit mål
• Opdateret app-ikon
• Fejlrettelser og pålidelighedsforbedringer bag kulisserne
```

**Swedish:**

```
Se dina mönster och nå ditt mål — lugnt och privat som alltid.

• Tagga vad som utlöste en påse — ett valfritt tryck, aldrig ett krav
• Ny Mönster-vy: dina svåraste tider på dygnet och vanligaste triggers
• Ditt dagliga mål visas nu i hela påsar, inte decimaler
• En mild påminnelse om din takt ser för snabb ut — sänk den när du vill
• Ett lugnt firande den dag du når ditt mål
• Uppdaterad appikon
• Buggfixar och pålitlighetsförbättringar bakom kulisserna
```

**Norwegian:**

```
Se mønstrene dine og nå målet ditt — rolig og privat som alltid.

• Merk hva som utløste en porsjon — ett valgfritt trykk, aldri påkrevd
• Ny Mønster-oversikt: dine vanskeligste tider på døgnet og vanligste triggere
• Det daglige målet ditt vises nå i hele porsjoner, ikke desimaler
• Et mildt vink hvis tempoet ditt ser for raskt ut — senk det når som helst
• En rolig feiring den dagen du når målet ditt
• Oppdatert app-ikon
• Feilrettinger og pålitelighetsforbedringer bak kulissene
```

---

## iOS App Version 1.4.1 — Superseded by 1.5.0 (build 19, was live June–July 2026)

Hotfix release on top of v1.4.0/build 18 — see "Known regression in 1.4.0" at the bottom of this section.

### Promotional Text (valgfrit, max 170 tegn)

Kan ændres uden ny version. Evergreen-versioner anbefales — release-specifikke kan rotate ind 14 dage efter approval.

**English (evergreen):**

```
A gentler way to reduce nicotine pouches. No accounts, no cloud, no streak anxiety — just your pace, your data, your phone.
```

**Danish (evergreen):**

```
En blidere måde at trappe ned for snus og nikotinposer. Ingen konto, ingen sky, ingen streak-angst — bare dit tempo, dine data, din iPhone.
```

**Swedish (evergreen):**

```
Ett mildare sätt att minska snus och nikotinpåsar. Inget konto, inget moln, ingen streak-ångest — bara din takt, dina data, din iPhone.
```

**Norwegian (evergreen):**

```
En mildere måte å trappe ned snus og nikotinposer. Ingen konto, ingen sky, ingen streak-angst — bare ditt tempo, dine data, din iPhone.
```

**English (release-specific, optional rotation):**

```
Now with onboarding progress, safer reset, and a warmer breathing finish. Calm, private, no streak shame — just step-by-step reduction at your pace.
```

### What's New (v1.4.1)

**English:**

```
A calmer onboarding, safer reset, warmer support tools.

• Onboarding now shows your progress through the 4-step setup
• Hold-to-confirm replaces the easy-to-mistap "Delete Everything" alert
• Breathing exercise ends with a warm "Nicely done" celebration
• "Open Settings" shortcut when notifications need permission
• Bar chart legend now documents every state (Under / Over / No data / Upcoming)
• Better contrast on dark-mode switches; bigger touch targets across the app
• Faster Progress screen load
• Bug fixes and reliability improvements behind the scenes
```

**Danish:**

```
Roligere onboarding, tryggere nulstilling, varmere støtteværktøjer.

• Onboarding viser nu din fremgang gennem de 4 trin
• Hold-for-at-bekræfte erstatter den nemt-uheldige "Slet alt"-besked
• Vejrtrækningsøvelsen slutter nu med et varmt "Flot klaret"
• "Åbn Indstillinger"-genvej når notifikationer mangler tilladelse
• Søjlediagrammet dokumenterer nu alle 4 tilstande (Under / Over / Ingen data / Kommende)
• Bedre kontrast på switches i mørk tilstand; større trykflader overalt
• Hurtigere fremgang-skærm
• Fejlrettelser og pålidelighedsforbedringer bag kulisserne
```

**Swedish:**

```
Lugnare onboarding, säkrare återställning, varmare stödverktyg.

• Onboarding visar nu dina framsteg genom de 4 stegen
• Håll-för-att-bekräfta ersätter den lätt-att-tryck-fel-på "Radera allt"-varningen
• Andningsövningen avslutas nu med ett varmt "Snyggt jobbat"
• "Öppna Inställningar"-genväg när aviseringar saknar tillstånd
• Stapeldiagrammets förklaring dokumenterar nu alla 4 lägen (Under / Över / Ingen data / Kommande)
• Bättre kontrast på reglage i mörkt läge; större tryckytor i hela appen
• Snabbare Framsteg-skärm
• Buggfixar och pålitlighetsförbättringar bakom kulisserna
```

**Norwegian:**

```
Roligere onboarding, tryggere tilbakestilling, varmere støtteverktøy.

• Onboarding viser nå fremgangen din gjennom de 4 trinnene
• Hold-for-å-bekrefte erstatter den lett-å-trykke-feil-på "Slett alt"-varselet
• Pusteøvelsen avsluttes nå med en varm "Bra jobbet"
• "Åpne Innstillinger"-snarvei når varsler mangler tillatelse
• Søylediagrammets forklaring dokumenterer nå alle 4 tilstander (Under / Over / Ingen data / Kommende)
• Bedre kontrast på brytere i mørk modus; større trykkpunkter overalt
• Raskere Fremgang-skjerm
• Feilrettinger og pålitelighetsforbedringer bak kulissene
```

### Known regression in 1.4.0 (build 18)

- Build 18 shipped to TestFlight with unresponsive Buttons across the entire app (welcome-screen "Get Started" CTA blocked onboarding). Root cause: a focus-ring `style` callback added in #166 silently disabled press handling on `Animated.createAnimatedComponent(Pressable)`. Reverted in 1.4.1 (#174). Build 18 was never submitted to the App Store; only build 19 went to review.

---

## iOS App Version 1.3.1 — Distribution

### Promotional Text (valgfrit, max 170 tegn)

Kan ændres uden ny version:

```
Pick your own taper pace. Edit your plan anytime. Undo accidental logs. All data stays on your iPhone — no cloud, no accounts, no subscriptions.
```

### What's New (v1.3.1)

**English:**

```
• Undo toast now appears at the top with stronger contrast — easier to see and tap
• Cleaner inputs on the Edit Plan screen
• Refreshed brand color
• Tightened privacy: extra safeguards keep your usage data out of error reports
• Stability and small fixes
```

**Danish:**

```
• Fortryd-toasten kommer nu fra toppen med bedre kontrast — lettere at se og trykke på
• Klarere inputfelter på "Ret plan"-skærmen
• Opdateret brandfarve
• Strammet privatliv: ekstra sikkerhedsnet holder dine brugsdata ude af fejlrapporter
• Stabilitet og mindre rettelser
```

**Swedish:**

```
• Ångra-toasten visas nu från toppen med bättre kontrast — lättare att se och trycka på
• Tydligare inmatningsfält på Ändra plan-skärmen
• Uppdaterad varumärkesfärg
• Skärpt integritet: extra skyddsnät håller din användningsdata borta från felrapporter
• Stabilitet och småfixar
```

**Norwegian:**

```
• Angre-toasten vises nå fra toppen med bedre kontrast — lettere å se og trykke på
• Tydeligere inntastingsfelt på Endre plan-skjermen
• Oppdatert merkefarge
• Skjerpet personvern: ekstra sikkerhetsnett holder brukerdataene dine borte fra feilrapporter
• Stabilitet og småfikser
```

> Subtitle, Promotional Text, Description og Keywords er uændrede fra v1.3 — se sektionen længere nede.

## iOS App Version 1.3 — Distribution (submitted 2026-04-24, live)

### Promotional Text (valgfrit, max 170 tegn)

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

> **Superseded for subtitle / keywords / promo by 1.6.0.** The Swedish and Norwegian **subtitles**, all four **keyword** fields, and the **promotional texts** were refreshed in the 1.6.0 ASO pass — see "ASO fields shipped with 1.6.0" near the top of this file for the current values. The **descriptions** below are still current. This block is kept as the v1.3 historical record.

Endelige tekster som er indsendt til App Store Connect for v1.3 på dansk, svensk og norsk. Disse subtitles, promo-tekster, descriptions og keywords er stadig aktuelle for v1.4.x (kun "What's New" ændres mellem patch-releases — find 1.4.1 og 1.3.1 release notes længere oppe). Promo-tekster for v1.4.x findes længere oppe i denne fil.

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
