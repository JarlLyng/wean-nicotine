# Target Audience

Who Wean Nicotine is for, why they convert, and what that means for the product. The goal of this document is focus: every feature, message, and channel decision should point at the people below, not at "everyone who uses nicotine."

> **Confidence note.** First-party data is still thin (low single-digit downloads as of June 2026), so this is built mostly on market research plus the directional signals we _do_ have (Google Search Console queries, the markets our first downloads came from, and the self-selection baked into the product). Each section flags how solid the claim is. Treat the personas as hypotheses to validate with GSC + download data, not settled fact. Live status lives in the issue tracker and GSC, not here.

## The one-sentence audience

**A Nordic, daily snus / nicotine-pouch user — most often a 25–45-year-old man, increasingly also women — who wants to _cut down and regain control_ rather than quit cold turkey overnight, and who would rather pay once for a private, account-free tool than be the product of a free one.**

Everything below expands that sentence.

## The core insight: we sell to reducers, not quitters

The market splits on _method_, and we deliberately serve one side:

- **Cold-turkey quitters** stop all at once. Evidence is genuinely mixed but often favours them on raw long-term abstinence (a 2016 _Annals of Internal Medicine_ trial found 4-week quit rates of 49% cold turkey vs 39% gradual). These people don't need a taper app — they need willpower and a date. **Not our audience.**
- **Reducers / taperers** find "stop tomorrow" overwhelming or have already failed it, and want to step down gradually while practicing craving management at lower intensity. Gradual reduction is widely reported as _more approachable_ and is supported as a valid path (Lindson et al., Cochrane Review 2019). **This is our entire audience.**

So the target user is self-selecting: they've typically _tried cold turkey and relapsed_, or they _dread the shock and want a softer on-ramp_. The product's "wean, don't punish" framing is not a tagline — it's audience targeting. We win the person who wouldn't otherwise start.

_Confidence: high on the segmentation logic; the product literally only makes sense for this segment._

## Market context (why this is worth doing)

- **Nicotine pouches are one of the fastest-growing consumer categories in the world.** Global market ~USD 6.9B in 2025, projected ~USD 42.4B by 2033 (CAGR ~24.7%); monthly sales rose ~250% between Jan 2023 and Aug 2025. ([Grand View Research](https://www.grandviewresearch.com/industry-analysis/nicotine-pouches-market-report), [Cognitive Market Research](https://www.cognitivemarketresearch.com/nicotine-pouches-market-report))
- **The Nordics are the deepest market by prevalence.** ~14% of Nordic adults use snus/pouches daily — now more common than cigarettes — and highest in Iceland, Norway, and Sweden. ([Nordic Monitoring 2025 / NORMO](https://pub.norden.org/nord2025-026/smoking-snuff-nicotine-pouches-and-e-cigarettes.html))
- **The product itself is shifting from traditional snus to nicotine pouches.** Pouch share of the oral-nicotine market: Sweden 5%→55% and Norway 22%→56% (2018–2025); in Denmark pouches (2.4%) have overtaken snus (0.8%). ([Scandinavian sales-trends study, PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC12904098/)) — **implication: lead with "nicotine pouches," not just "snus."**
- **A large younger, global, pouch-native cohort is forming fast** (Zyn ~84% of US pouch users; youth/young-adult use roughly quadrupled 2022–2025). This is a future TAM, mostly outside the Nordics and mostly English-speaking. ([CDC Foundation](https://www.cdcfoundation.org/blog/Nicotine-Pouch-Use-Surges-Among-Young-People))

_Confidence: high — multiple independent market and public-health sources agree._

## Demographics

| Dimension     | Where the user sits                                                                                                                         | Source / confidence                                            |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| **Age**       | Mostly under 45; core 25–45. A growing 18–29 pouch-native cohort.                                                                           | Nordic Monitoring 2025 — high                                  |
| **Gender**    | Skews male (Nordic daily use: men 19.8% vs women 6.8%), but women are the fastest-growing pouch segment and now buy more pouches than snus. | NORMO 2025 — high                                              |
| **Geography** | Sweden (largest market), Norway, Denmark first. Then EN-speaking pouch markets (UK, US) as a secondary, harder frontier.                    | NORMO + our GSC/download signals — medium                      |
| **Platform**  | iPhone (app is iOS-only today).                                                                                                             | Product fact                                                   |
| **Spend**     | Pouches run ~€4–6/can; a can-a-day habit is on the order of ~€1,500–2,200/year (estimate). Real money — the savings angle is credible.      | Retailer pricing; per-user totals are an estimate — low/medium |

## Primary personas

### P1 — The Nordic taper-seeker _(primary; all our signals converge here)_

25–45, daily snus/pouch user in Sweden, Norway, or Denmark. Has probably tried to quit before and relapsed, or doesn't want the cold-turkey shock. Wants fewer pouches per day, less money spent, and the feeling of being back in control — not necessarily zero tomorrow. Privacy-aware enough to dislike "create an account to track your health." Will pay 29 DKK once; allergic to subscriptions.
**Why we believe it:** GSC shows Norwegian/Danish impressions and "trapp ned snus" already ranking; first downloads came from Sweden and Denmark; the whole product is built for exactly this person. _Confidence: medium-high._

### P2 — The privacy-first reducer _(cross-market, overlaps P1)_

Defined by values rather than geography: distrusts data-harvesting health apps, wants local-only/no-account, may have read about health-app data sales. Overlaps heavily with P1 but also exists in EN markets. This is our sharpest _differentiator_ — most quit/habit apps are cloud, account-based, subscription, and ad-supported.
**Why we believe it:** it's the product's strongest structural advantage (local-first, no backend, open source). _Confidence: medium — plausible and on-brand, but unproven in conversion data._

### P3 — The young pouch-native (Zyn generation) _(secondary / future)_

18–29, came up on nicotine pouches (not traditional snus), often fitness/health- or cost-motivated, global/EN-speaking, heavy on TikTok/Reddit. Enormous and fast-growing TAM, **but** the hardest to win for us right now: English-only would compete head-on, they skew toward free tools, and they're not where our current organic signal is.
**Why it's secondary:** big future prize, weak present fit (no localized content, iOS-only, paid). Revisit when Nordic traction is proven and/or Android ships (#45). _Confidence: high that it's large; high that it's not the near-term focus._

## What motivates them to act (triggers)

In rough order of how often they surface for reducers:

1. **Control / autonomy** — "I don't like that I _need_ this." The strongest, most durable motivator; the app's daily allowance speaks directly to it.
2. **Cost** — real money per year; the built-in savings tool makes the abstract concrete.
3. **Health** — general unease about long-term dependence rather than acute illness.
4. **Fitness / sport** — performance-minded users cutting nicotine.
5. **Life events** — pregnancy, a new relationship, a health scare, a New Year's resolution.
6. **Dependence fatigue** — tired of the loop, has tried before, wants a method that doesn't feel like punishment.

_Confidence: medium — consistent across quit-guides and harm-reduction sources, but not yet validated against our own users._

## Where they are (markets and channels, ranked)

**Markets:** Sweden > Norway > Denmark for size and fit; EN markets later. Sweden is the largest snus market; Norway is where we already rank ("trapp ned snus"); Denmark gave early downloads.

**Channels that fit this audience** (consistent with the broader marketing analysis):

- **Nordic low-competition SEO** — the durable core. Localized taper landing pages (NO/SV/DA) now exist; lean in.
- **Own-network links** (iamjarl.com → Wean) and **Indie Hackers** — discovery + a clean backlink profile.
- **Nordic quit/snus communities** — long game, participate-first (Reddit gatekeeps new accounts; not a quick win).

**Channels that do _not_ fit** (proven this session): Show HN (posts removed), generic English Reddit (gatekeeped, low relevance), and any B2B/SaaS channel (cold email, Capterra/G2, "powered by").

## Product implications

- **Say "nicotine pouches," not only "snus."** The market has shifted to pouches and a younger cohort uses that word; snus stays prominent for the Nordic core.
- **Keep local-first and account-free loud.** It's the single clearest differentiator for P2 and a trust signal for P1 — it should be visible in store copy, the website, and onboarding.
- **Protect the "wean, don't punish" tone.** It _is_ the targeting. No streak-shaming, no aggressive cold-turkey framing.
- **The daily allowance + savings + craving tools are the right core** — they map onto the top three triggers (control, cost, health). Don't dilute them.
- **One-time price is a feature for this audience**, not a limitation. Keep "no subscription, no ads, no data sale" front and centre.
- **Android (#45) is the gate to P3.** The young global pouch cohort is large but largely Android and price-sensitive; don't chase it until Nordic iOS traction is proven.

## Honest caveats and open questions

- **The cold-turkey-vs-gradual evidence is mixed**, not a clean win for tapering. Our claim should stay "as approachable / a valid path" (Cochrane 2019), not "scientifically superior." Overclaiming is a credibility risk.
- **First-party validation is the missing piece.** The fastest way to upgrade this document from hypothesis to fact: watch which GSC queries/pages convert and which countries downloads come from over the next weeks.
- **Gender split is shifting.** Messaging and visuals skewing heavily male would miss the fastest-growing (female, pouch-first) segment.
- **Open questions to resolve with data:** Which trigger converts best (control vs cost vs health)? Is P2 (privacy) a real driver of installs or just a nice-to-have? Does the Nordic SEO actually convert to paid downloads, or just impressions?

## Sources

- [Nordic Monitoring 2025 (NORMO) — smoking, snuff, nicotine pouches](https://pub.norden.org/nord2025-026/smoking-snuff-nicotine-pouches-and-e-cigarettes.html)
- [Scandinavian oral-nicotine sales trends 2018–2025 (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC12904098/)
- [Grand View Research — global nicotine pouches market](https://www.grandviewresearch.com/industry-analysis/nicotine-pouches-market-report)
- [Cognitive Market Research — nicotine pouches market](https://www.cognitivemarketresearch.com/nicotine-pouches-market-report)
- [CDC Foundation — nicotine pouch use surges among young people](https://www.cdcfoundation.org/blog/Nicotine-Pouch-Use-Surges-Among-Young-People)
- [Global State of Tobacco Harm Reduction — Sweden](https://gsthr.org/countries/profile/swe/) · [Denmark](https://gsthr.org/countries/profile/dnk/)
- Cold turkey vs gradual quit rates: 2016 _Annals of Internal Medicine_ trial (as summarized in quit-method literature)
- Gradual reduction as a valid path: Lindson et al., Cochrane Review 2019 (cited across the website)
