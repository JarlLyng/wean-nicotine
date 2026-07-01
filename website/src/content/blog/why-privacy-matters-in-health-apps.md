---
title: 'Why privacy matters in health apps'
description: "A nicotine usage log is the kind of data you don't want leaving your phone. Here's the specific case for local-first health tools and what to look for before you install one."
pubDate: 2026-06-05
author: 'Jarl Lyng'
tags: ['privacy', 'local-first', 'positioning']
---

Most health apps default to the cloud. You create an account, you sync, your data lives on someone else's server. That works fine when the data is innocuous — step counts, water intake, sleep hours. It becomes a problem when the data is the kind that could embarrass you, get you denied coverage, or simply remind you of a difficult chapter you'd rather not have on file forever.

A nicotine usage log is squarely in that second category. So is anything that looks like an addiction track record. So is anything tied to a chronic condition, a mental-health pattern, or a personal habit you're trying to break.

This piece is the case for local-first health apps in general, and what to actually look for if you care.

<figure class="taper-figure">
<svg viewBox="0 0 800 320" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="privacy-diagram-title privacy-diagram-desc" class="privacy-diagram">
	<title id="privacy-diagram-title">Local-first versus cloud-based data flow for a health app</title>
	<desc id="privacy-diagram-desc">Two side-by-side diagrams. On the left, a typical cloud health app: the phone sends data through the network to a company server, which then exposes it to backups, analytics providers, insurance queries, subpoenas, and breaches. On the right, a local-first app: the phone stores data in an on-device database, and no data leaves the device.</desc>
	<g font-family="var(--font-body)" font-size="13" fill="var(--text-primary)">
		<text x="200" y="30" text-anchor="middle" font-weight="600" fill="var(--text-secondary)">Typical cloud health app</text>
		<text x="600" y="30" text-anchor="middle" font-weight="600" fill="var(--primary)">Local-first (Wean)</text>
	</g>
	<line x1="400" y1="20" x2="400" y2="300" stroke="var(--border-subtle)" stroke-width="1" stroke-dasharray="4 4" />
	<g>
		<rect x="140" y="60" width="120" height="60" rx="10" fill="var(--bg-muted)" stroke="var(--border-subtle)" stroke-width="1.5" />
		<text x="200" y="88" text-anchor="middle" font-family="var(--font-body)" font-size="13" fill="var(--text-primary)" font-weight="600">Your phone</text>
		<text x="200" y="106" text-anchor="middle" font-family="var(--font-body)" font-size="11" fill="var(--text-secondary)">app + data entry</text>
		<line x1="200" y1="120" x2="200" y2="150" stroke="var(--text-secondary)" stroke-width="2" marker-end="url(#arrow-secondary)" />
		<rect x="140" y="155" width="120" height="50" rx="10" fill="none" stroke="var(--text-secondary)" stroke-width="1.5" stroke-dasharray="4 4" />
		<text x="200" y="185" text-anchor="middle" font-family="var(--font-body)" font-size="12" fill="var(--text-secondary)">Company server</text>
		<g font-family="var(--font-body)" font-size="11" fill="var(--text-tertiary)">
			<line x1="200" y1="205" x2="200" y2="225" stroke="var(--text-tertiary)" stroke-width="1" />
			<line x1="60" y1="225" x2="340" y2="225" stroke="var(--text-tertiary)" stroke-width="1" />
			<line x1="80" y1="225" x2="80" y2="245" stroke="var(--text-tertiary)" stroke-width="1" />
			<line x1="160" y1="225" x2="160" y2="245" stroke="var(--text-tertiary)" stroke-width="1" />
			<line x1="240" y1="225" x2="240" y2="245" stroke="var(--text-tertiary)" stroke-width="1" />
			<line x1="320" y1="225" x2="320" y2="245" stroke="var(--text-tertiary)" stroke-width="1" />
			<text x="80" y="260" text-anchor="middle">Backups</text>
			<text x="160" y="260" text-anchor="middle">Analytics</text>
			<text x="240" y="260" text-anchor="middle">Subpoena</text>
			<text x="320" y="260" text-anchor="middle">Breach</text>
			<text x="80" y="275" text-anchor="middle" fill="var(--text-secondary)">forever</text>
			<text x="160" y="275" text-anchor="middle" fill="var(--text-secondary)">3rd party</text>
			<text x="240" y="275" text-anchor="middle" fill="var(--text-secondary)">legal</text>
			<text x="320" y="275" text-anchor="middle" fill="var(--text-secondary)">risk</text>
		</g>
	</g>
	<g>
		<rect x="540" y="60" width="120" height="60" rx="10" fill="var(--primary-subtle)" stroke="var(--primary)" stroke-width="1.5" />
		<text x="600" y="88" text-anchor="middle" font-family="var(--font-body)" font-size="13" fill="var(--text-primary)" font-weight="600">Your phone</text>
		<text x="600" y="106" text-anchor="middle" font-family="var(--font-body)" font-size="11" fill="var(--text-secondary)">app + data entry</text>
		<line x1="600" y1="120" x2="600" y2="150" stroke="var(--primary)" stroke-width="2" marker-end="url(#arrow-primary)" />
		<rect x="540" y="155" width="120" height="50" rx="10" fill="var(--primary-subtle)" stroke="var(--primary)" stroke-width="1.5" />
		<text x="600" y="180" text-anchor="middle" font-family="var(--font-body)" font-size="12" fill="var(--text-primary)" font-weight="600">SQLite on device</text>
		<text x="600" y="196" text-anchor="middle" font-family="var(--font-body)" font-size="11" fill="var(--text-secondary)">encrypted with your phone</text>
		<text x="600" y="245" text-anchor="middle" font-family="var(--font-body)" font-size="12" fill="var(--primary)" font-weight="600">No network. No account.</text>
		<text x="600" y="264" text-anchor="middle" font-family="var(--font-body)" font-size="12" fill="var(--primary)" font-weight="600">No copy elsewhere.</text>
	</g>
	<defs>
		<marker id="arrow-secondary" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
			<path d="M0,0 L10,5 L0,10 z" fill="var(--text-secondary)" />
		</marker>
		<marker id="arrow-primary" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
			<path d="M0,0 L10,5 L0,10 z" fill="var(--primary)" />
		</marker>
	</defs>
</svg>
<figcaption>Every arrow leaving your phone in the left diagram is a data path a cloud health app is subject to. Wean removes all of them by never having the arrows in the first place.</figcaption>
</figure>

## What "local-first" means and why it matters

A local-first app stores your data on the device you used to enter it. There's no server-side copy. There's no account. There's no sync. If you delete the app, the data is gone with it.

The trade-off is real: you can't switch phones without exporting, you can't share with a clinician through a portal, you can't pull a five-year backup from the cloud. For most people most of the time, those trade-offs are easy to accept — because the benefit is that the data simply doesn't exist anywhere outside your own device.

That benefit looks abstract until you list the concrete failure modes it eliminates:

- **Insurance underwriting.** Health and life insurers don't (yet) read your apps. They could. The boundary holds because of regulation, not technology. A local-first app is invisible to that boundary regardless of how it shifts.
- **Account breaches.** Every cloud service eventually leaks. A breach of a "quit smoking" app's user database is the kind of dataset that makes the news. A local-first app has nothing for an attacker to target server-side.
- **Subpoenas and government requests.** In some jurisdictions, the legality of substances you might be tracking is ambiguous or hostile. A server holding "user X used N pouches on date Y" is a record that can be requested by a court. A local DB on an iPhone in your pocket cannot.
- **Employer / family visibility.** Shared computers, family iCloud, work-managed devices — there are many ways someone else can stumble into your data when it syncs. Local-first cuts those paths at the source.
- **Future-you regret.** You quit, you delete the app, the chapter is closed. With a cloud service, that "closed" status depends on the company's data-retention policy, the policy's actual implementation, and the company's continued existence.

You may not care about any single one of those scenarios today. You don't know which one you'll care about in five years.

## The dishonest middle ground

Many apps describe themselves as "privacy-first" while still operating in the cloud. The usual marketing pattern:

- "End-to-end encryption" (you trust the company to actually implement it correctly and not retain the keys).
- "GDPR compliant" (a legal status, not a privacy guarantee — it just means they have a Data Processing Agreement).
- "We don't sell your data" (until they pivot the business model, or get acquired, or change the privacy policy with 30 days' notice that you won't read).
- "Anonymous" (re-identification of anonymized health data is well-documented in the academic literature — usually trivial when combined with other signals).

None of these claims is necessarily false in the marketing copy. They just all depend on continued good behavior by a company that has the data. The local-first approach takes the question off the table by not having the data.

## What to look for in a "private" health app

If you're shopping for any health-tracking app — not just a nicotine one — here's the checklist that separates real privacy from marketing claims:

### Hard signals (binary, easy to verify)

- **Account required to use it?** If yes, it's not local-first. Doesn't matter what else they claim.
- **Network connection required for core features?** If yes, data is leaving the device whether they tell you that or not.
- **App Privacy section in the App Store lists "Data Linked to You" or "Data Used to Track You"?** Apple makes you declare this. Read it before installing.

### Soft signals (require trust, but easier to verify than encryption)

- **Open source?** Not a guarantee, but it means independent researchers can verify the privacy claims rather than taking marketing at face value.
- **One-time purchase rather than subscription?** Subscription models have ongoing financial pressure to retain users and expand data use. One-time purchases don't.
- **No third-party SDKs for analytics or ads?** Even "privacy-friendly" analytics SDKs send something. The cleanest answer is "none."
- **Open about exactly which third parties get what?** A crash reporter is reasonable. A marketing SDK is not. The privacy policy should name names.

### Red flags

- "Sign in with Google/Facebook" as a primary option.
- A privacy policy longer than the app description.
- "We may share data with our marketing partners."
- Any health app that includes ads.

## What Wean Nicotine specifically does

To be useful, an example is worth more than a checklist. Here's what Wean does and doesn't do, item by item:

- **Account?** No. No sign-up flow exists.
- **Cloud sync?** No. The SQLite database lives on your iPhone. If you delete the app, the data is deleted.
- **Network calls during normal use?** None. The app works fully offline.
- **Analytics SDK?** None. The app has a local analytics table for its own UX improvements (which screens you visit, which tools you use) — that table never leaves your phone.
- **Crash reporting?** Sentry is used to capture technical crashes. The Sentry integration is configured with an automatic PII scrubber that strips known user-data fields (baseline, price, currency, triggers, pouch counts) before any event leaves the device. Crash data also doesn't get sent in development builds. The full scrubber rules live in [the Sentry integration code](https://github.com/JarlLyng/wean-nicotine/blob/main/lib/sentry.ts).
- **Subscription?** None. One-time App Store purchase.
- **Marketing site analytics?** The marketing website uses Umami, a cookieless, privacy-friendly analytics tool that doesn't track users across sites or collect personal data. It's self-hosted on EU infrastructure. Full details are on the [privacy page](/privacy/).
- **Source code?** Open at [github.com/JarlLyng/wean-nicotine](https://github.com/JarlLyng/wean-nicotine). MIT licensed. You can verify any of the claims above by reading the code.

That's not the whole landscape — there are other local-first apps worth checking — but it's an existence proof that you can ship a health tool without the cloud as a load-bearing component.

## The "I have nothing to hide" trap

A common response to all of this is: I don't care, I have nothing to hide. The response misses how privacy actually works. You don't make privacy decisions for who you are right now; you make them for every future version of yourself you can't predict.

The data you generate today about a nicotine taper is just data. In ten years, depending on regulation, on insurer behavior, on your career, on relationships you haven't started yet, it might mean something specific. Or it might mean nothing. The point of local-first isn't that you know which scenario will play out — it's that the data simply isn't available to play any of them out.

## The shortest honest summary

If a health app needs your data to function, it has your data. Promises about how it'll be used are conditional on the company's continued ability and willingness to keep them. Local-first is the version of "we don't have it" that doesn't require trust — you can verify it by turning off your phone's network connection and seeing the app still work.

For data you wouldn't want leaving your pocket, that's the only design that holds up over time.

---

_If you're looking for a nicotine reduction app that fits the description above: [Wean Nicotine](https://apps.apple.com/app/wean-nicotine/id6758867485) is on the App Store. One-time purchase, no accounts, no cloud. The [privacy policy](/privacy/) is the short version; the [source code](https://github.com/JarlLyng/wean-nicotine) is the long one._
