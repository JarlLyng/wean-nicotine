# SEO & ASO Strategy — Wean Nicotine

Site: https://weannicotine.iamjarl.com  
App Store: https://apps.apple.com/app/wean-nicotine/id6758867485  
Google Search Console: Connected  
Last updated: 2026-04-15

---

## 1. Product positioning

Wean Nicotine is a calm, private iPhone app for reducing snus and nicotine pouches gradually. One-time purchase, no accounts, no cloud, local-first.

SEO positioning: **the snus and nicotine pouch reduction app** — not a generic "quit smoking" tool.

Competitors in search: NicQuit, Smoke Free, QuitNow, generic habit trackers. Wean differentiates on snus-specificity, gradual tapering, and privacy.

---

## 2. What is already in place

### Website technical SEO (done)

- [x] Astro SSG with `@astrojs/sitemap` → auto-generated sitemap
- [x] `robots.txt` → allows full crawl, references sitemap
- [x] `MobileApplication` JSON-LD in Layout.astro (price: 29 DKK)
- [x] `FAQPage` JSON-LD on homepage with 8 questions
- [x] OG tags, Twitter cards, canonical URLs in Layout.astro
- [x] `hreflang` tags for en/da/sv/no with `x-default`
- [x] `apple-itunes-app` meta tag (app-id=6758867485)
- [x] Skip-to-content link, semantic HTML, dark mode
- [x] Google Fonts (Inter + Outfit) with `preconnect`
- [x] Scroll reveal with IntersectionObserver
- [x] Mobile hamburger nav
- [x] Google Search Console connected

### Homepage (done)

- [x] Strong H1: "A gentler way to quit nicotine."
- [x] Kicker: "Calm. Private. No shame."
- [x] 8-item FAQ section with FAQPage JSON-LD
- [x] "How it works" section (3 steps)
- [x] Screenshots showcase (v1.2)
- [x] Feature cards (6 features)
- [x] Nature break mid-page CTA
- [x] Social proof bar (4 items)
- [x] App Store badge with campaign tracking

### i18n (done)

- [x] 4 languages configured: en (default), da, sv, no
- [x] UI translations in `i18n/ui.ts`
- [x] Route-based locale prefixing (`/da/`, `/sv/`, `/no/`)
- [x] Localized App Store badge text

### SEO landing pages — English (done)

All 9 pages use `SeoLandingLayout.astro` with proper h1, title, description, canonical, campaign token.

| Page | Campaign token |
|------|---------------|
| `/snus-reduction-app/` | `seo_en_snus` |
| `/nicotine-pouch-reduction-app/` | — |
| `/how-to-reduce-snus/` | — |
| `/how-to-quit-nicotine-pouches/` | — |
| `/how-to-handle-nicotine-cravings/` | — |
| `/taper-nicotine/` | — |
| `/track-snus-use/` | — |
| `/track-nicotine-pouches/` | — |
| `/private-quit-nicotine-app/` | — |

### SEO landing pages — Scandinavian (done)

| Language | Pages |
|----------|-------|
| Danish (`/da/`) | homepage, `stop-med-snus-app`, `hvordan-stopper-man-med-snus`, privacy, support |
| Norwegian (`/no/`) | homepage, `slutte-med-snus-app`, `hvordan-slutte-med-snus`, privacy, support |
| Swedish (`/sv/`) | homepage, `sluta-snusa-app`, `hur-slutar-man-snusa`, privacy, support |

### Cross-linking (done)

Footer links to: iamjarl.com, wodrounds.iamjarl.com, madebyhuman.iamjarl.com  
Footer links to all 8 English SEO landing pages in two columns ("Resources" + "Guides").

### Campaign tracking (done)

- [x] `getCampaignAppStoreUrl()` in `site.ts` appends `pt` and `ct` parameters
- [x] Provider token: `1111l4fWe`
- [x] Campaign tokens per page (e.g., `seo_en_snus`)

---

## 3. Completed fixes (April 2026)

- [x] JSON-LD price fixed: `price: '29'`, `priceCurrency: 'DKK'` (was `price: '0'`)
- [x] BreadcrumbList JSON-LD added to all 14 SEO landing pages (8 EN + 6 Scandinavian)
- [x] Campaign tokens added to all 14 SEO landing pages
- [x] App Store URL changed to country-neutral (`/app/wean-nicotine/id6758867485`)

### Campaign tokens in use

| Page | Token |
|------|-------|
| `/snus-reduction-app/` | `seo_en_snus` |
| `/nicotine-pouch-reduction-app/` | `seo_en_pouch` |
| `/how-to-reduce-snus/` | `seo_en_guide_snus` |
| `/how-to-quit-nicotine-pouches/` | `seo_en_guide_pouch` |
| `/how-to-handle-nicotine-cravings/` | `seo_en_guide_craving` |
| `/taper-nicotine/` | `seo_en_taper` |
| `/track-snus-use/` | `seo_en_track_snus` |
| `/track-nicotine-pouches/` | `seo_en_track_pouch` |
| `/private-quit-nicotine-app/` | `seo_en_private` |
| `/da/stop-med-snus-app/` | `seo_da_app` |
| `/da/hvordan-stopper-man-med-snus/` | `seo_da_guide` |
| `/no/slutte-med-snus-app/` | `seo_no_app` |
| `/no/hvordan-slutte-med-snus/` | `seo_no_guide` |
| `/sv/sluta-snusa-app/` | `seo_sv_app` |
| `/sv/hur-slutar-man-snusa/` | `seo_sv_guide` |

---

## 4. ASO — App Store Optimization

### App Store metadata (copy-paste ready)

Disse felter er allerede dokumenteret i `docs/APP_STORE_METADATA.md` og er opdateret til v1.2. De vigtigste:

**App name:** Wean Nicotine (verificer dette er det der står i App Store Connect)  
**Subtitle (30 tegn):** `Reduce nicotine at your pace`  
**Keywords (100 tegn):** `nicotine,snus,wean,quit,reduce,cessation,habit,tracking,pouches,progress,velvære,sundhed,nikotin,trappe`

### Anbefalede keyword-felter per storefront

Nuværende keyword-felt blander engelsk og dansk. Apple indexerer per storefront-sprog. Anbefalede opsplitninger (tracked in [#18](https://github.com/JarlLyng/Taper/issues/18)):

**Engelsk (US/UK/int.):**
```
nicotine,snus,quit,reduce,taper,pouch,cessation,tracker,craving,zyn,velo,allowance,gradual,habit
```

**Dansk (DK):**
```
nikotin,snus,nedtrapning,stop,skær ned,vane,sporing,poser,fremskridt,velvære,sundhed,nikotinpose,trang
```

**Svensk (SE):**
```
nikotin,snus,sluta,minska,nedtrappning,vana,spårning,prilla,framsteg,hälsa,portionssnus,vitt snus,sug
```

**Norsk (NO):**
```
nikotin,snus,slutte,redusere,nedtrapping,vane,logging,poser,fremgang,helse,nikotinposer,sug,taper
```

### App Store-beskrivelsens første sætning

Første 1-2 sætninger vises i søgeresultater. Den nuværende (fra APP_STORE_METADATA.md) er god:

> "Wean Nicotine helps you reduce nicotine use step by step—whether you use snus, pouches, or similar products."

Ordet "snus" er med — det er afgørende for Skandinavisk synlighed.

### Screenshots-strategi (2026)

Apple's AI-genererede App Store Tags læser nu metadata OG screenshots. Sørg for at screenshot-captions indeholder target keywords:

- Screenshot 1: "Track daily snus and nicotine pouch use"
- Screenshot 2: "Gradual reduction with weekly allowance"
- Screenshot 3: "See your progress and money saved"
- Screenshot 4: "Breathing exercises for cravings"
- Screenshot 5: "Private — all data stays on your device"

---

## 5. Keyword-strategi

### Tier 1 — Højeste relevans (target nu)

- snus reduction app
- nicotine pouch reduction app
- taper nicotine app
- reduce snus gradually
- quit nicotine pouches app
- cut down snus app

### Tier 2 — Informationelle (landing pages dækker disse)

- how to reduce snus
- how to quit nicotine pouches
- how to taper nicotine
- how to handle nicotine cravings
- track snus use

### Tier 3 — Differentiering

- private nicotine tracker
- offline habit tracker nicotine
- no account quit app

### Tier 4 — Skandinavisk (høj intent, lav konkurrence)

- sluta snusa app (SV)
- stop med snus app (DA)
- slutte med snus app (NO)
- nikotinpose nedtrapning (SV/DA/NO)
- minska snus (SV)

---

## 6. GEO — Generative Engine Optimization

### Hvad der er på plads

Homepage-FAQ'en er allerede struktureret godt til AI-ekstraktion: 8 spørgsmål med direkte svar. `FAQPage` JSON-LD er korrekt implementeret.

`MobileApplication` schema er på plads i Layout.astro (price: 29 DKK, priceCurrency: DKK).

### Optimér landing pages til AI-passage-ekstraktion

Tracked in [#20](https://github.com/JarlLyng/Taper/issues/20).

AI-motorer (ChatGPT, Perplexity, Google AI Overviews) udtrækker individuelle afsnit. Hver landing page bør have:

1. En direkte, faktuel åbningssætning i første afsnit (svarer på søgeforespørgslen)
2. Selvstændige sektioner (forståelige uden at læse resten af siden)
3. Mindst ét konkret datapunkt per sektion (fx "reduces daily allowance by 5% per week")

**Target queries for AI-citation:**

- "What is the best app to quit snus?" → `/snus-reduction-app/` bør citeres
- "How do I reduce nicotine pouch use gradually?" → `/how-to-quit-nicotine-pouches/`
- "Is there an app to taper off snus?" → homepage eller `/taper-nicotine/`
- "Best private app for quitting nicotine" → `/private-quit-nicotine-app/`

### Tilføj statistik og kildehenvisninger

Tracked in [#21](https://github.com/JarlLyng/Taper/issues/21).

GEO-forskning viser at indhold med konkrete tal og kilder får op til 40% højere AI-synlighed. Tilføj til landing pages:

- "The average snus user consumes 12–15 pouches per day" (kilde: Folkhälsomyndigheten)
- "Wean Nicotine reduces your daily allowance by 5% per week by default"
- "All data is stored locally — zero data leaves your device"

---

## 7. Indhold der stadig mangler

Alle manglende indholdssider er oprettet som GitHub Issues med `website` + `seo` labels:

- **Comparison pages** (P2): Wean vs. habit trackers, gradual reduction vs. cold turkey
- **Ekstra skandinaviske sider** (P2): Nikotintrang-hjælp for DA/SV/NO
- **Blog-artikler** (P3): Tips for reducing snus, tapering approach, privacy in health apps

Se [website + seo issues](https://github.com/JarlLyng/Taper/issues?q=is%3Aopen+label%3Awebsite+label%3Aseo) for den fulde liste.

---

## 8. Where to make noise

Wean Nicotine bør deles i communities hvor målgruppen allerede er. Tonen skal være autentisk og hjælpsom.

### Reddit

- **r/Snus** (~50k) — svar på tråde om at reducere/stoppe snus. Del Wean når relevant.
- **r/NicotinePouches** — kommentarer om nedtrapning
- **r/QuitVaping** (~20k) — overlap med nicotine pouch-brugere
- **r/stopsmoking** (~250k) — nævn Wean i diskussioner om graduel reduktion
- **r/DecidingToBeBetter** — personlig historie: "Jeg byggede en app for at hjælpe mig med at stoppe med snus"
- **r/SideProject** — indie dev-vinkel
- **r/Sweden** / **r/Denmark** / **r/Norway** — lokale fællesskaber, snuskultur

### Product Hunt

- Tagline: "Reduce snus and nicotine pouches step by step"
- Kategori: Health & Fitness
- Maker story: personlig vinkel
- Launch tirsdag eller onsdag formiddag

### Andre kanaler

- **Indie Hackers** — produktsektion + "how I built" artikel
- **Hacker News** — Show HN når appen har traction
- **AlternativeTo.com** — list som alternativ til NicQuit, Smoke Free, QuitNow
- **Skandinaviske tech/sundhedsblogs** — pitch "den skandinaviske tilgang til nikotinreduktion"
- **Twitter/X** — #buildinpublic, #indiedev

---

## 9. Task tracking

All SEO, ASO, and marketing tasks are tracked as GitHub Issues with priority labels.

| Priority | Filter |
|----------|--------|
| P1 — do now | [P1 issues](https://github.com/JarlLyng/Taper/issues?q=is%3Aopen+label%3AP1) |
| P2 — this month | [P2 issues](https://github.com/JarlLyng/Taper/issues?q=is%3Aopen+label%3AP2) |
| P3 — nice to have | [P3 issues](https://github.com/JarlLyng/Taper/issues?q=is%3Aopen+label%3AP3) |
| SEO | [SEO issues](https://github.com/JarlLyng/Taper/issues?q=is%3Aopen+label%3Aseo) |
| ASO | [ASO issues](https://github.com/JarlLyng/Taper/issues?q=is%3Aopen+label%3Aaso) |
| Marketing | [Marketing issues](https://github.com/JarlLyng/Taper/issues?q=is%3Aopen+label%3Amarketing) |

### Completed (April 2026)

- Fix JSON-LD pris (29 DKK)
- BreadcrumbList tilføjet til alle 14 landing pages
- Campaign tokens tilføjet til alle 14 landing pages
- App Store URL ændret til landenneutral
