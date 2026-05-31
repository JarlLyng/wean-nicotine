# App Store Screenshot Captions

This file proposes caption text for the App Store screenshot frames, optimized to surface target keywords *before* the user reads the long description. App Store search now ranks screenshot text — captions matter for ASO almost as much as keywords.

**Source files:** `Screenshots/v1.2/` (raw simulator output) → upscaled / framed deliverables in `App store screens/V1.2/`.

**Convention:**
- 1 strong benefit per screenshot.
- One target keyword per caption (English: *snus*, *nicotine pouches*, *taper*, *cravings*, *progress*, *private*). Localized variants below.
- Plain prose, sentence case. No emoji. No exclamation marks (calmer feel; matches "wean, don't punish").
- ≤ 60 characters per line, ≤ 2 lines.

---

## Screenshot order (8 total)

| # | Screen | Source file (Screenshots/v1.2/) |
|---|--------|----------------------------------|
| 1 | Onboarding — Welcome | `01-onboarding.png` |
| 2 | Onboarding — Baseline | `02-baseline.png` |
| 3 | Onboarding — Price | `03-price.png` |
| 4 | Onboarding — Triggers | `04-triggers.png` |
| 5 | Today / Daily allowance | `05-today.png` |
| 6 | Progress (weekly chart) | `06-progress.png` |
| 7 | Tools (breathing / urge) | `07-tools.png` |
| 8 | Cost savings | `08-savings.png` |

---

## English (en-US, en-GB, en-CA — App Store primary)

| # | Headline (≤ 30 char) | Sub-line (≤ 60 char) |
|---|----------------------|----------------------|
| 1 | Cut snus, your pace | A calm app to reduce nicotine pouches. |
| 2 | Start where you are | Set a real baseline — no judgment, no shame. |
| 3 | See the money saved | Optional cost tracking in your currency. |
| 4 | Know your triggers | Pick the moments cravings hit hardest. |
| 5 | Today's allowance | One‑tap log. Undo any mistake in 5 seconds. |
| 6 | Watch progress build | Weekly chart, gentle milestones, no streaks. |
| 7 | Tools for cravings | Breathing, urge‑surfing, short reflections. |
| 8 | Money back in pocket | See how much your taper has already saved you. |

---

## Danish (da)

| # | Headline | Sub-line |
|---|----------|----------|
| 1 | Skær ned på snus | En rolig app til at trappe nikotin ned. |
| 2 | Start hvor du er | Sæt et ærligt udgangspunkt — uden skam. |
| 3 | Se hvad du sparer | Valgfri prissporing i din valuta. |
| 4 | Kend dine triggere | Vælg de situationer hvor trangen rammer. |
| 5 | Dagens ration | Ét tryk for at logge. Fortryd inden 5 sek. |
| 6 | Følg din fremgang | Ugentlig graf, milepæle, ingen streaks. |
| 7 | Værktøjer mod trang | Vejrtrækning, urge‑surfing, refleksion. |
| 8 | Penge tilbage i lommen | Se hvor meget din nedtrapning har sparet. |

---

## Swedish (sv)

| # | Headline | Sub-line |
|---|----------|----------|
| 1 | Minska snuset i din takt | En lugn app för att trappa ner nikotin. |
| 2 | Börja där du är | Sätt en ärlig utgångspunkt — utan skam. |
| 3 | Se vad du sparar | Frivillig prisspårning i din valuta. |
| 4 | Känn dina triggers | Välj stunderna när suget slår till. |
| 5 | Dagens ranson | Ett tryck för att logga. Ångra inom 5 sek. |
| 6 | Följ dina framsteg | Veckodiagram, mjuka milstolpar, inga streaks. |
| 7 | Verktyg mot suget | Andning, urge‑surfing, korta reflektioner. |
| 8 | Pengar tillbaka | Se hur mycket nedtrappningen redan sparat. |

---

## Norwegian (no — Bokmål)

| # | Headline | Sub-line |
|---|----------|----------|
| 1 | Trapp ned snusen | En rolig app for å redusere nikotin. |
| 2 | Start der du er | Sett et ærlig utgangspunkt — uten skam. |
| 3 | Se hva du sparer | Valgfri prissporing i din valuta. |
| 4 | Kjenn triggerne | Velg situasjonene der suget slår til. |
| 5 | Dagens kvote | Ett trykk for å logge. Angre innen 5 sek. |
| 6 | Følg fremgangen | Ukentlig graf, milepæler, ingen streaks. |
| 7 | Verktøy mot sug | Pusteøvelser, urge‑surfing, refleksjon. |
| 8 | Penger spart | Se hvor mye nedtrappingen har spart deg for. |

---

## Notes

- **Headlines** include or imply a target keyword that App Store search indexes (snus / snuset / snusen, nicotine, taper, cravings, trang, sug).
- **Sub-lines** carry a secondary benefit phrase that matches search intent ("reduce nicotine pouches", "trappe ned", "minska snuset", etc.).
- Avoid claims we can't substantiate ("the easiest", "guaranteed", "scientifically proven"). Apple's review team rejects unsubstantiated superlatives in screenshots.
- Re-export framed PNGs from the `.sdev` source in `App store screens/Taper.sdev` once captions are finalized.

## Next steps

1. Review wording with native Swedish + Norwegian speakers (current text is best-effort).
2. Update `App store screens/Taper.sdev` with the new captions.
3. Export framed deliverables to `App store screens/V1.3/` (mirroring the existing V1.2 layout).
4. Upload to App Store Connect under **Previews and Screenshots** → **Phone** for each localization.
5. Keep the raw simulator captures in `Screenshots/v1.2/` (already there) so future edits can re-frame without losing the source images.
