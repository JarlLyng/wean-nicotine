# Review af marketingsitet: UX, UI, SEO og GEO

Dato: 2026-09-08. Projekt: Wean Nicotine. Gennemgået checkout: `4c183d1`.

GEO bruges her om synlighed og korrekt gengivelse i generative søgetjenester og AI-svar.

## Vurdering

De vigtigste forbedringer er at rette fejlagtige sundhedspåstande, defekte sprogskift og den beskårne navigation på tablet. Dernæst bør forsiden vise produktet tidligere og give et mere konkret svar på, hvad man køber. Flere SEO-sider og mere animation vil ikke i sig selv løse disse problemer.

Sitet har et brugbart fundament: statisk Astro-output, overskuelige produktfunktioner, rigtige app-screenshots, self-hostede skrifttyper, AVIF/WebP i heroen, canonical-tags, sitemap, sprogangivelser, FAQ-indhold og en blog med navngiven forfatter. Umami-events og App Store-kampagnelinks findes allerede. Anbefalingerne tager udgangspunkt i den aktuelle version; tidligere reviewfund fra april er ikke automatisk videreført.

## Grundlag og begrænsninger

- Live-sitet blev gennemgået i browser på den engelske og danske forside samt udvalgte guides. Visuelle stikprøver: 1280 × 720, 768 × 1024, 390 × 844 og 320 × 740, i lyst tema.
- `npm run build` i `website/` bestod og genererede 41 HTML-sider, inklusive 404-siden.
- Det genererede HTML blev analyseret for interne links, hreflang, canonical og indgående links. Fundene gælder buildets almindelige HTML-links; sitemap og eksterne links kan stadig give adgang til sider uden interne indgående links.
- Bloggens beregningseksempel blev kontrolleret mod `lib/taper-plan.ts`, inklusive `estimateWeeksToZero()`.
- Eksterne kildehenvisninger blev kontrolleret mod forskningsartikler, Google Search Central og W3C.
- Ingen adgang til Search Console, Umami-rapporter, App Store Connect eller serverlogs blev anvendt. Der er derfor ikke målt placeringer, konverteringsrate, AI-omtaler eller Core Web Vitals fra virkelige brugere. Ingen Lighthouse-score eller fuld tilgængelighedscertificering er udarbejdet. Mobiltesten er browseremulering, ikke fysisk iPhone/Safari-test.

P1 = ret snarest, især før mere trafik sendes til sitet. P2 = næste forbedringsrunde. P3 = efterfølgende finpudsning. Forslag til bedre konvertering er hypoteser, som bør måles.

## P1: Konkrete fejl og troværdighed

### 1. Ret sundhedspåstande og brug kilder inden for deres faktiske område

**Fund:** Flere guides bruger Burke et al. som belæg for, at registrering alene reducerer snusforbrug med 15–20 %. Den identificerbare reviewartikel af Burke, Wang og Sevick handler om selvmonitorering ved vægttab. Henvisningen på sitet mangler titel, år og link, og giver ikke dokumentation for det specifikke resultat om snus.

Lindson et al. 2019 bruges tilsvarende til generelle udsagn om, at nedtrapning af snus/nikotinposer er lige så effektivt som brat stop. Det pågældende Cochrane-review handler om rygestop. Bloggen går endnu længere og hævder blandt andet, at de fleste gennemfører et ni måneders taper-forløb, mens meget få gennemfører et 15 %-forløb. Der er ikke dokumentation for disse succesrater i artiklen.

**Konsekvens:** Besøgende kan træffe valg på et forkert grundlag. AI-svar kan videreformidle de præcise, men udokumenterede tal. Det underminerer også bloggens erklæring om faktatjek.

**Anbefaling:** Fjern effektprocenter og succesrater uden direkte relevant dokumentation. Skeln tydeligt mellem forskning i rygning, viden om snus/nikotinposer og appens egne produktvalg. Tilføj fulde, klikbare referencer ved konkrete påstande og beskriv begrænsningerne. Undgå at præsentere en bestemt app-indstilling som et dokumenteret sikkert eller bedst virkende behandlingstempo. En disclaimer nederst korrigerer ikke en misvisende påstand øverst.

**Steder:** `website/src/pages/track-snus-use/index.astro:25`, `website/src/pages/how-to-reduce-snus/index.astro:51`, `website/src/pages/da/trappe-ned-snus/index.astro:73`, `website/src/pages/gradual-reduction-vs-cold-turkey/index.astro:47`, `website/src/content/blog/how-the-tapering-approach-works.md:24` og `:97`. Kontroller også oversættelser, metabeskrivelser og FAQ/JSON-LD.

**Kilder:** [Burke et al.: Self-Monitoring in Weight Loss](https://pmc.ncbi.nlm.nih.gov/articles/PMC3268700/) og [Lindson et al.: Smoking reduction interventions for smoking cessation](https://pubmed.ncbi.nlm.nih.gov/31565800/).

**Godkendelseskriterium:** Hver kvantificeret sundhedspåstand kan spores til en relevant kilde med samme population og resultat. Produktfordele beskrives uden opdigtede kliniske resultater.

### 2. Brug appens beregning i bloggens nedtrapningseksempler

**Fund:** Bloggen siger, at 12 poser/dag ved 5 % ugentlig reduktion når nul omkring uge 36. Appens beregning giver 1,9 ved uge 36, som vises som 1 hel pose. Det viste mål bliver først nul i uge 50. Ved 3 % fra samme baseline bliver det viste mål nul i uge 84, ikke omkring uge 50.

**Anbefaling:** Generer tabeller, figurer og eksempler fra samme beregning som appen. Skriv altid baseline, procent og om tallet er den beregnede kvote eller det viste heltalsmål. Skeln mellem, at et planlagt mål når nul, og at en person faktisk er stoppet. Overvej en lille planberegner som produktdemonstration, med beregning uden indsamling af brugerens indtastninger.

**Steder:** `website/src/content/blog/how-the-tapering-approach-works.md:24`, `:94`, `:95` og `lib/taper-plan.ts`.

**Godkendelseskriterium:** Tekst, graf, billedbeskrivelse og app giver samme resultat for mindst baseline 12 ved 3 %, 5 %, 10 % og 15 %. Den mulige beregner skal være et illustrativt planværktøj, ikke en prognose for ryge-/snusstop.

### 3. Ret defekte sprogskift og forbind reelle oversættelser

**Fund:** På `/how-to-reduce-snus/` fører valget DA til `/da/how-to-reduce-snus`, som viser en 404-side. Bekræftet ved klik på live-sitet. SV og NO peger også på ruter, som ikke findes i buildet. De samme ugyldige adresser udsendes som hreflang.

Andre oversatte guides bruger kun deres eget sprog i hreflang. Fra `/da/trappe-ned-snus/` sendes svenske og norske læsere derfor til forsiderne, selvom `/sv/trappa-ner-snus/` og `/no/trappe-ned-snus/` eksisterer. Den generelle hjælpefunktion udskifter kun sprogpræfikset; den oversætter ikke sluggen.

**Anbefaling:** Opret et eksplicit kort over sider og deres oversatte URL'er. Brug det til sprogmenu, hreflang og sitemap. Forbind kun sider, der faktisk er ækvivalente. Brug sprogets forside som tydeligt fallback, når en oversættelse mangler. 404-sidens sprogmenu skal også føre til fungerende forsider frem for `/da/404` osv.

**Steder:** `website/src/i18n/utils.ts:15`, `website/src/components/LanguageSwitcher.astro:21`, `website/src/layouts/Layout.astro:25`, `website/src/pages/how-to-reduce-snus/index.astro:14` og `website/src/pages/404.astro`.

**Godkendelseskriterium:** Alle sprogmenu-links fører til gyldige sider. Hreflang peger på eksisterende, tilsvarende og gensidigt henvisende sprogversioner. [Google: lokaliserede versioner](https://developers.google.com/search/docs/specialty/international/localized-versions).

### 4. Ret headeren på tablet og mellemstore skærme

**Fund:** Ved 768 px bredde slutter headerens App Store-knap ved x = 852,4 px. Cirka 84 px ligger uden for viewporten. Brandnavnet bryder samtidig over to linjer. Mobilmenuen aktiveres først ved 700 px, mens de fulde sprognavne aktiveres ved 768 px. `overflow-x: hidden` skjuler overløbet.

**Anbefaling:** Skift til den kompakte navigation, før indholdet ikke længere kan være der, eksempelvis omkring 960 px efter afprøvning på alle sprog. Bevar én tydelig downloadhandling og komprimer sprogvælgeren. Lad ikke global clipping fungere som løsning på headerens breddeproblem.

**Steder:** `website/src/layouts/Layout.astro:302`, `:361`, `:377`, `website/src/components/LanguageSwitcher.astro:96` og `website/src/styles/global.css:35`.

**Godkendelseskriterium:** Brand, navigation og hele CTA'en er synlige og betjenelige ved 700, 768, 820, 900 og 1024 px, også med længere lokaliserede tekster og ved tekstforstørrelse.

### 5. Gør vigtig tekst og produktindhold læsbart uden animation

**Fund:** `.reveal` starter med `opacity: 0`. Forsidens overskrift, CTA og produktbillede er afhængige af JavaScript og IntersectionObserver for at blive synlige. På dansk mobilforside er billedet stadig usynligt ved første viewport, fordi kun en lille del af elementet ligger inden for skærmen. Den globale flydeanimation har ikke en fælles reduced-motion-regel; den engelske forside har sin egen undtagelse, men NordicHome har ikke den tilsvarende.

**Anbefaling:** Vis indhold som standard. Begræns eventuel indgangsanimation til dekorative elementer, og undlad reveal på H1, primær CTA og det vigtigste screenshot. Tilføj global respekt for `prefers-reduced-motion` og en fungerende navigation uden JavaScript.

**Steder:** `website/src/styles/global.css:111`, `:127`, `website/src/layouts/Layout.astro:127` og `website/src/components/NordicHome.astro:71`.

**Godkendelseskriterium:** H1, downloadlink, billeder og links er tilgængelige ved deaktiveret/fejlende JavaScript. Reduced motion stopper flydende telefoner og unødvendige overgange. Dette er et robustheds- og UX-fund; der er ikke dokumenteret et konkret indekseringstab.

### 6. Forbedr kontrasten på den lyse sekundære tekst

**Fund:** Heroens fineprint bruger `#94a3b8` på `#f8fafc`, cirka 2,45:1 i kontrast, ved 13 px. Det omfatter købs- og privatlivsinformation, som bør kunne læses uden anstrengelse. Samme token bruges til blandt andet blogmetadata og footer-tekst.

**Anbefaling:** Brug en mørkere tekstfarve til meningsbærende småtekster, og reserver den lyse nuance til dekoration. Kontroller de faktiske baggrunde i både lyst og mørkt tema.

**Steder:** `website/src/styles/tokens.css:59`, `website/src/components/NordicHome.astro:180` og `website/src/pages/index.astro:452`.

**Godkendelseskriterium:** Almindelig tekst opfylder mindst 4,5:1; stor tekst mindst 3:1. [W3C: Contrast Minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

## P2: UX og UI, der gør produktet lettere at vælge

### 7. Gør heroen kortere og mere konkret

**Observation:** Den danske hero er cirka 1.528 px høj ved 390 × 844. Produktbilledet begynder omkring y = 810 før scroll-animationens forskydning, og næste sektion begynder først omkring y = 1.593. På 320 px brydes den engelske H1 uhensigtsmæssigt med ordet “to” på sin egen linje.

**Anbefaling:** Reducer topafstand og overskriftsstørrelse på små skærme, og fjern det tvungne `<br/>`, hvor det giver dårlige linjeskift. Prioriter produktnavn, produktkategori, et konkret screenshot og downloadhandling. Brug én hovedhandling og et diskret link til “Se appen”; privatliv kan fortsat være tydeligt tilgængeligt uden en konkurrerende stor knap.

Mulig dansk formulering, til redaktionel tilpasning:

> **Wean Nicotine**
>
> App til at registrere og gradvist reducere snus og nikotinposer. Vælg dit tempo, registrer hver pose, og følg din daglige kvote. Til iPhone. Engangskøb uden abonnement.

Oplys den verificerede pris eller henvis tydeligt til lokal pris i App Store. Forsidens FAQ spørger i dag efter prisen uden at angive et beløb, mens andre sider og schema angiver 29 DKK. Det er ikke kontrolleret, om 29 DKK stadig er korrekt.

**Steder:** `website/src/components/NordicHome.astro`, `website/src/pages/index.astro:125`, `:305`, `website/src/styles/tokens.css:31`.

**Mål:** Produkt, platform og købsmodel forstås ved første visning. På mobil bør man se en meningsfuld del af appen og få et naturligt signal om, at der er mere nedenunder.

### 8. Vis arbejdsforløbet frem for at gentage funktionskort

**Observation:** Den engelske forside har tre “How it works”-kort, tre store screenshots, seks funktionskort, en ekstra CTA-sektion og otte FAQ-kort. På mobil stables det til en lang række. Dansk/svensk/norsk har en enklere skabelon uden det tilsvarende screenshot-overblik. Den primære forskel, justerbart tempo og automatisk kvote, får mindre plads end de generiske budskaber om ro og privatliv.

**Anbefaling:** Byg sidens fortælling omkring tre konkrete øjeblikke: vælg baseline/tempo, registrer en pose, se ændringen i kvote og historik. Sæt forklaringer ved det relevante screenshot. Vis også centrale aktuelle funktioner såsom justering af planen og fortryd registrering, hvor de er repræsentative for den udgivne app. Kontroller screenshots mod den aktuelle App Store-version; mappenavnet `v1.2` er ikke i sig selv bevis for, at et billede er forkert.

Brug færre indrammede tekstkort, mere almindelig typografisk struktur og en kompakt FAQ, eventuelt med native `details/summary`. Bevar svar i HTML. Giv de nordiske sider samme adgang til produktbevis som den engelske.

**Steder:** `website/src/pages/index.astro:188`, `:218`, `website/src/components/NordicHome.astro:108`.

**Mål:** Man kan vurdere produktet uden at læse hele siden. Mål derefter ændringen i relevante App Store-klik frem for blot scroll-længde.

### 9. Fuldfør lokalisering og tastaturbetjening

**Fund:** Danske sider har engelske labels som “Skip to content”, “Toggle menu”, “More from IAMJARL” og App Store-badgens alternative tekst. Dansk FAQ bruger “core features”. Blog-linket skifter til engelsk uden at gøre det tydeligt. Mobilmenuen åbner og lukker ved klik, men Escape lukkede den ikke i browserprøven.

**Anbefaling:** Oversæt alle labels via samme tekstsystem. Markér engelske artikler, indtil lokale versioner findes. Giv mobilmenuen `aria-controls`, Escape-lukning og en forudsigelig fokusadfærd; en almindelig navigationsmenu behøver ikke automatisk en modal fokusfælde. Oplys appens faktiske tilgængelige sprog, så et oversat website ikke utilsigtet lover en oversat app. Få DA/SV/NO korrekturlæst af sprogkyndige; eksempelvis er “et lille, konkret kut” unaturligt dansk.

**Steder:** `website/src/layouts/Layout.astro:149`, `:158`, `:183`, `website/src/components/AppStoreBadge.astro:29`, `website/src/pages/da/index.astro` og `website/src/pages/da/trappe-ned-snus/index.astro:69`.

**Mål:** Navigation og købsflow kan forstås på sidens sprog og bruges med tastatur. Test desuden på fysisk iPhone/Safari.

## P2: SEO og GEO med tydeligt indhold og struktur

### 10. Forbind de nordiske guides med resten af sitet

**Fund:** Buildets HTML har ingen indgående links fra andre sider til `/da/nikotin-trang-hjaelp/`, `/sv/nikotinsug-hjalp/` og `/no/nikotinsug-hjelp/`. Den fælles footer viser kun guidekolonner på engelsk. De nordiske forsider peger ikke på deres egne hjælpeguides.

**Anbefaling:** Tilføj en lille lokal “Guides”-sektion i navigation/footer og relevante links fra afsnittet om trang. Forbind hver guide med den relevante appside og nært beslægtede artikler. Brug beskrivende, naturlige ankertekster. Sæt en kort indholdsfortegnelse øverst i lange guides, så læsere kan gå direkte til deres spørgsmål.

**Steder:** `website/src/layouts/Layout.astro:219`, `website/src/components/NordicHome.astro` og de tre nævnte guideruter.

**Mål:** Hver vigtig guide har mindst ét relevant indgående indholdslink og kan nås fra det pågældende sprogs forside. Et sitemap alene giver ikke besøgende en vej til indholdet.

### 11. Saml sider efter brugerens behov og reducer gentagelser

**Observation:** Der er stort tematisk overlap mellem “how to reduce”, “taper”, “quit” og blogindlæg om samme fremgangsmåde. På dansk overlapper `/da/hvordan-stopper-man-med-snus/` og `/da/trappe-ned-snus/`. Flere sider gentager samme procenttal, produktfordele og CTA uden et tydeligt anderledes svar.

**Anbefaling:** Lav et kort over søgeintentioner, før der bestilles mere indhold:

| Behov                    | Sidens primære opgave                                                       |
| ------------------------ | --------------------------------------------------------------------------- |
| Vælge en app             | Platform, købsmodel, aktuelle screenshots, funktioner og begrænsninger      |
| Forstå gradvis reduktion | Metode, korrekt regneeksempel, relevant dokumentation og begrænsninger      |
| Håndtere trang           | Konkret, kildeunderstøttet hjælp og tydelig adgang til yderligere støtte    |
| Vurdere privatliv        | Hvilke oplysninger der lagres, hvad der sendes, modtagere og brugerens valg |
| Sammenligne alternativer | Saglig, dateret sammenligning af verificerede egenskaber                    |

Behold separate sider, når de besvarer forskellige behov. Vurder sammenlægning ud fra indhold og Search Console-data, ikke blot lignende titler. Ved sammenlægning skal hostingens mulighed for rigtige HTTP-redirects afklares; en canonical eller HTML-redirect er ikke det samme som en 301.

Omskriv brede konkurrentpåstande som “no habit tracker does” og “the tracker is useless” til præcise, verificerbare forskelle. Undgå at fremstille læserens valg af anden metode som en forventet fiasko.

**Steder:** `website/src/pages/wean-vs-habit-tracker/index.astro:16`, `:47`, nedtrapningsguides og `website/src/content/blog/`.

**Begrundelse:** Google anbefaler originalt, nyttigt indhold frem for separate sider for enhver søgevariant. Overlappet er en redaktionel risiko; faktisk kannibalisering eller en søgestraf er ikke konstateret. [Google: generativ AI-søgning](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide).

### 12. Gør afsender og produktfakta lettere at verificere

**Observation:** Bloggen har forfatter og AI-disclosure, men guide-layoutet mangler synlig forfatter, fagligt grundlag og dato for gennemgang. Bloglayoutet kan skrive `dateModified` til schema, men viser kun udgivelsesdatoen. Flere formuleringer om privatliv er absolutte, selvom privatlivspolitikken beskriver både Sentry og website-analytics.

**Anbefaling:** Tilføj en kort afsenderside med udviklerens rolle, erfaring, kontakt og sammenhængen mellem IAMJARL og Wean Nicotine. Vis gennemgangsdato ved reelle indholdsændringer. Angiv kun faglig reviewer, hvis en kvalificeret person faktisk har gennemgået indholdet. Link produktfakta til offentlig kode, den aktuelle App Store-side og en præcis privatlivsforklaring.

Brug eksempelvis “Dine registreringer og din plan gemmes lokalt” frem for “Alle data bliver på enheden”. Forklar appdiagnostik og websitebesøg separat. Kontroller privatlivspolitikkens kategoriske udsagn om Umami, hosting og datamodtagere mod den faktiske drift; dette review har ikke undersøgt Umami-konfigurationen eller foretaget en juridisk vurdering.

**Steder:** `website/src/layouts/BlogPostLayout.astro:59`, `website/src/layouts/SeoLandingLayout.astro:56`, `website/src/components/BlogDisclosure.astro`, `website/src/pages/privacy.astro:5`, `:56`, `:66` og forsidernes privacy-FAQ.

**Mål:** Både en læser og en AI-tjeneste kan identificere produktet, afsenderen, kilden og begrænsningen uden at skulle forene modstridende udsagn. GitHub-repoets offentlige synlighed blev verificeret, så link til kildekoden kan bruges som konkret transparens.

### 13. Prioriter reel informationsværdi i GEO

**Anbefaling:** Gør sitet til en god primærkilde om Wean Nicotine: en korrekt forklaring af kvoteberegningen, en tydelig funktionsoversigt, egne aktuelle screenshots, korte produktvideoer og dokumenterede svar på spørgsmål om offlinebrug, pris, ændring af plan og sletning. En beregner eller tabel fra punkt 2 giver mere særskilt værdi end endnu en generisk artikel om fem tips.

Skriv direkte svar, fordi det hjælper læseren. Tilføj detaljer og kilder dér, hvor de er nødvendige. Undgå kunstige ordgrænser, unaturlig gentagelse af brandet, skjulte AI-instruktioner og fabrikerede anbefalinger. Hold præcis information ens på sitet og i App Store.

`robots.txt` tillader allerede generel crawling. Det beviser ikke, at alle AI-crawlere kan nå sitet gennem hosting/CDN, eller at indholdet bliver indekseret og citeret. Kontroller relevante crawlere mod deres officielle dokumentation og faktiske svar/logs, hvis problemer opstår. Skeln mellem adgang til søgning og adgang til modeltræning.

**Aktuelt pr. reviewdato:** Google siger, at `llms.txt` ikke hjælper eller skader synligheden i Google Search; der er ingen særlig GEO-markup, som i sig selv giver adgang. Google har også udfaset FAQ-rich-results fra 7. maj 2026. Bevar nyttige FAQ-svar, men investér ikke i FAQ-schema for at opnå den tidligere søgeresultatvisning. Andre tjenester kan have andre regler, og ingen ændring garanterer AI-citater. [Google: AI-optimering](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) og [Google: ændringslog](https://developers.google.com/search/updates).

### 14. Gør målingen konsistent, før designet optimeres

**Fund:** `Button.astro` kan skelne CTA-placering, men `AppStoreBadge.astro` bruger altid `source="badge"`. NordicHome angiver ikke `trackSource`, og footerens direkte App Store-links har ingen Umami-event. Header og flere forsidehandlinger bruger den almindelige App Store-URL, mens nogle SEO-handlinger har `pt`/`ct`.

**Anbefaling:** Brug samme eventnavn og felter for `placement`, `locale` og side på alle App Store-handlinger. Giv hero, header, artikel og footer forskellige placeringer. Samordn kampagnekoder med App Store Connect. Send ikke personlige helbredsoplysninger eller indtastninger fra en planberegner til analytics.

Mål landingsside → App Store-klik pr. sprog og trafikkilde. Sammenhold med aggregerede App Store-kampagneresultater, hvor de er tilgængelige; et klik er ikke et køb. Brug Search Console til forespørgsler, indeksering og CTR. Følg AI-henvisninger og et lille fast sæt manuelle prøveforespørgsler, men betragt ikke en enkelt AI-genereret omtale som en stabil placering.

**Steder:** `website/src/components/Button.astro:26`, `website/src/components/AppStoreBadge.astro:23`, `website/src/components/NordicHome.astro:78`, `website/src/layouts/Layout.astro:214` og `website/src/lib/site.ts:14`.

## P3: Teknisk og visuel finpudsning

### 15. Ensret URL-signaler, sociale previews og billedlevering

Canonical på engelsk `/privacy` bruger ikke afsluttende slash, mens den danske bruger `/da/privacy/`, og sitemap bruger katalogruter. Standardiser interne links, canonical, hreflang og sitemap efter hostingens endelige URL'er. Det er konsistensarbejde; en konkret rankingeffekt er ikke målt.

Bloglayoutet bruger den generiske sociale metadata fra Layout: `og:type="website"` og samme standardbillede. `coverImage` kan indgå i BlogPosting-schema, men sendes ikke videre til Layout som `ogImage`. Tilføj artikeltype, relevant billede, korrekt alternativ tekst og synlig dato. Brug stabile identiteter for app, udgiver og forfatter i strukturerede data, og vis den samme pris, valuta og produktinformation i det menneskeligt læsbare indhold. Kontrollér aktuelle krav til eventuelle rich results, før mere schema tilføjes; markup er ikke et løfte om en bestemt visning.

Hero-billederne er allerede optimerede. De tre billeder i den engelske screenshot-sektion leveres stadig som PNG på samlet cirka 566 KiB. Brug også responsive AVIF/WebP-varianter her. Vurder en lokalt hostet officiel App Store-badge efter Apples retningslinjer, så den centrale CTA ikke afhænger af en ekstra billedservice. Fjern animation, blur og baggrundsbilleder, som ikke hjælper læseren med at forstå produktet, før der tilføjes mere visuel kompleksitet.

**Steder:** `website/src/layouts/Layout.astro:36`, `:44`, `:92`, `website/src/layouts/BlogPostLayout.astro:35`, `:45`, `website/src/pages/index.astro:227` og `website/src/components/AppStoreBadge.astro:15`.

**Kontrol:** Brug respons- og linktests samt aktuelle mobile lab- og feltmålinger. Der er ikke målt et Core Web Vitals-problem i denne gennemgang, så optimeringens performanceeffekt skal efterprøves.

## Foreslået rækkefølge og kontrol

| Runde | Arbejde                                                                                          | Kontrol før afslutning                                                                                         |
| ----- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| 1     | Ret påstande og regneeksempler; reparer sprogskift, header, reveal og tekstkontrast              | Kilder og beregninger stemmer; ingen defekte sproglinks; synlig CTA på tablet; læsbart indhold uden JS         |
| 2     | Kortere hero, tydelige produktfakta, bedre screenshots, lokal navigation og ensartede CTA-events | Manuel test på mobil/tablet/desktop og tastatur; alle vigtige guides har indgående links                       |
| 3     | Konsolider overlappende indhold, tilføj afsender/kilder og forbedr metadata                      | Search Console-data og redaktionel vurdering styrer sammenlægning; produktfakta er konsistente                 |
| 4     | Evaluer effekt efter tilstrækkelig trafik og tid til recrawl                                     | Sammenlign samme sprog, landingssidetype og trafikkilde; undgå at forveksle flere besøg med bedre konvertering |

Tilføj gerne en lille automatisk kvalitetskontrol af det byggede site: interne links og billeder, gyldige hreflang-mål, canonical-konsistens, JSON-LD-parsing og sider uden indgående links. Supplér med få visuelle regressionstests ved især 390 og 768 px samt manuel Safari- og tastaturtest. Et bestået Astro-build alene fanger ikke de fejl, der er fundet her.
