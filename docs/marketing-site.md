# Marketing site build spec — `https://taper.iamjarl.com` (Astro + GitHub Pages)

This is a **fully self-contained** build spec for an AI that will implement the Taper marketing website.
Do **not** assume access to any private repositories.

## 1) Goal
- Build an **SEO-first** marketing site for **Taper**.
- The site is a **static** Astro build hosted on **GitHub Pages**.
- Primary CTA is **“Download on the App Store”** (links to the App Store listing).
- The site must include an App Store-ready **Privacy Policy** page to use as the App Store Connect “Privacy Policy URL”.
- **Language**: **English only** (all user-facing copy).
- **No TestFlight mentions** anywhere.
- Canonical domain: **`https://taper.iamjarl.com`**

## 2) Hosting & DNS (Namecheap → GitHub Pages)
- GitHub Pages custom domain: `taper.iamjarl.com`
- Namecheap DNS:
  - Record type: **CNAME**
  - Host: `taper`
  - Target: `<github-username>.github.io`
  - TTL: Automatic
- Enable “Enforce HTTPS” in GitHub Pages once DNS has propagated.

## 3) Required routes
- `/` (landing one-pager)
- `/privacy` (Privacy Policy for App Store Connect)
- `/support` (optional but recommended)

## 4) App summary (truthful capabilities only)
Taper is an iPhone app that helps users gradually reduce snus / nicotine pouches in a calm, private, non-judgmental way.

What Taper does (safe to state):
- Onboarding: baseline pouches/day, optional price per can, optional trigger selection
- Today: daily allowance + one-tap logging (“Used a pouch”, “Resisted craving”)
- Progress: weekly + total progress (pouches avoided, money saved if price is set, milestones)
- Support tools: breathing, urge surfing, reflection prompts
- Optional notifications: daily check-in + trigger reminders
- “Start Over”: deletes local data and returns to onboarding
- Local-first: data stored on device

What Taper does NOT do (must NOT promise):
- No accounts / login
- No cloud sync
- No medical advice / clinical claims
- No ad tracking
- No “AI personalization”

## 5) Visual design system (match the app)
The app uses IAMJARL design tokens. Use these as the **source of truth** for the website theme.
Public reference: `https://jarllyng.github.io/iamjarl-design/` (tokens are conceptually aligned with the app).

### 5.1 Color tokens (use as CSS variables)
Implement **light + dark** theme using CSS variables.

**Light mode**
- `--primary`: `#00FF7B`
- `--on-primary`: `#000000`
- `--bg-app`: `#FFFFFF`
- `--bg-muted`: `rgba(0, 0, 0, 0.04)`
- `--bg-card`: `rgba(0, 0, 0, 0.04)`
- `--surface`: `#FFFFFF`
- `--surface-raised`: `rgba(0, 0, 0, 0.02)`
- `--text-primary`: `#000000`
- `--text-secondary`: `rgba(0, 0, 0, 0.70)`
- `--text-tertiary`: `rgba(0, 0, 0, 0.55)`
- `--border-subtle`: `rgba(0, 0, 0, 0.10)`
- `--border-default`: `rgba(0, 0, 0, 0.16)`

**Dark mode**
- `--primary`: `#D0FF00`
- `--on-primary`: `#000000`
- `--bg-app`: `#000000`
- `--bg-muted`: `rgba(255, 255, 255, 0.05)`
- `--bg-card`: `rgba(255, 255, 255, 0.05)`
- `--surface`: `#000000`
- `--surface-raised`: `rgba(255, 255, 255, 0.03)`
- `--text-primary`: `#FFFFFF`
- `--text-secondary`: `rgba(255, 255, 255, 0.75)`
- `--text-tertiary`: `rgba(255, 255, 255, 0.60)`
- `--border-subtle`: `rgba(255, 255, 255, 0.12)`
- `--border-default`: `rgba(255, 255, 255, 0.18)`

Semantic colors (shared)
- `--success`: `#4CAF50`
- `--warning`: `#FF6B35`
- `--error`: `#FF3B30`

### 5.2 Spacing + radius (CSS)
Use a spacing scale similar to the app:
- `--space-xs: 4px`
- `--space-sm: 8px`
- `--space-md: 12px`
- `--space-lg: 16px`
- `--space-xl: 20px`
- `--space-xxl: 24px`
- `--space-xxxl: 32px`

Radii:
- `--radius-sm: 8px`
- `--radius-md: 12px`
- `--radius-lg: 16px`
- `--radius-full: 9999px`

### 5.3 Typography (web)
Keep it calm and readable:
- Base: 16px / 24px line-height
- H1: ~44–56px (responsive), strong but not shouty
- H2: ~28–36px
- Use system UI font stack.

### 5.4 Components (website)
Implement small reusable components:
- `Button` (primary: App Store link)
- `Card` (feature blocks, FAQ)
- `Section` (layout + consistent spacing)
- `ScreenshotGallery` (responsive, lazy-loaded)

## 6) IA & sections (landing `/`)
Required section order:
1) **Hero**
   - H1 includes primary keyword: “snus” / “nicotine pouches” + “reduce” / “taper”
   - Subline: calm/private/no shame
   - CTA: **Download on the App Store** → `APP_STORE_URL`
   - Secondary: **Read privacy policy** → `/privacy`

2) **How it works** (3 steps)
   - Set baseline
   - Follow your daily allowance
   - Track progress + use tools when cravings hit

3) **Features** (cards)
   - Today
   - Progress
   - Support tools
   - Notifications (optional)
   - Start Over

4) **Screenshots**
   - 4–6 iPhone screenshots
   - Descriptive alt text for each screenshot (SEO + accessibility)

5) **Privacy-first**
   - Data stays on device
   - No accounts
   - No tracking
   - Start Over deletes data
   - Sentry is used only for crash/error reporting (if enabled in the build)

6) **FAQ** (short)
   - Not medical advice
   - Data storage is local
   - Delete everything (Start Over)
   - Works offline

7) **Footer**
   - App Store link
   - Privacy policy link
   - Support email
   - Copyright

## 7) App Store CTA behavior
- Use `APP_STORE_URL = "https://apps.apple.com/app/idXXXXXXXXXX"` until the real link is known.
- If the App Store URL is not known yet:
  - The CTA may show “Coming soon” and be disabled
  - Do **not** mention TestFlight

## 8) Privacy Policy page (`/privacy`) — App Store-ready
Tone: plain, clear, non-fluffy, English.

Required structure:
- Title: “Privacy Policy”
- “Last updated: YYYY-MM-DD”
- Who we are / data controller:
  - Name: **IAMJARL**
  - Website: `https://taper.iamjarl.com`
  - Contact: `support@iamjarl.com`
- Data we store locally on device:
  - Usage logs (pouch used / craving resisted + timestamps)
  - Settings (baseline, reduction plan parameters, optional triggers, optional price/currency)
  - Preferences (theme, notification toggles/time)
- What we do NOT do:
  - No accounts
  - No ad tracking
  - No selling data
- Notifications:
  - Local notifications if user enables permissions
- Third parties:
  - **Sentry** for crash/error reporting (if enabled in the build)
  - Explain at a high level what may be sent (error events, basic device/app context) and why (app stability)
- Data retention:
  - Data stays on device unless user deletes the app or uses “Start Over”
- Your choices:
  - How to delete data (“Start Over” inside the app)
  - How to contact support

## 9) SEO requirements (very important)
Implement all of the following:
- Unique `<title>` + meta description per page
- `rel="canonical"` pointing to `https://taper.iamjarl.com/...`
- Open Graph + Twitter cards
- `robots.txt` allowing indexing
- `sitemap.xml`
- Structured data (JSON-LD), include:
  - Type: `MobileApplication` (or `SoftwareApplication`)
  - Name: “Taper”
  - OperatingSystem: “iOS”
  - ApplicationCategory: “HealthApplication”
  - URL: canonical
  - App Store URL once known
- Performance:
  - Optimize images (WebP/AVIF), responsive `srcset`
  - Lazy-load screenshots

## 10) Accessibility requirements (web)
- Semantic landmarks (`header`, `main`, `section`, `footer`)
- Visible focus states
- Keyboard navigable
- Good contrast for critical text and CTA

## 11) Suggested repo structure
```
taper-site/
  src/
    layouts/BaseLayout.astro
    pages/
      index.astro
      privacy.astro
      support.astro
    components/
      Button.astro
      Card.astro
      Section.astro
      ScreenshotGallery.astro
    styles/
      tokens.css
      global.css
  public/
    favicon.svg
    og-image.png
    screenshots/
  astro.config.mjs
  package.json
  README.md
```

## 12) GitHub Pages deploy (Astro)
Use GitHub Actions to build and deploy to Pages.
Set Astro `site` to `https://taper.iamjarl.com` (important for sitemap + canonical).
Ensure `CNAME` is deployed for the custom domain.

## 13) Copy starter (English)
Hero options:
- “Reduce snus step by step — calmly.”
- “Taper off nicotine pouches without shame.”

Subline:
- “A calm, private iPhone app for gradual reduction, daily tracking, and supportive tools.”

Privacy section:
- “Your data stays on your device. No accounts. No tracking.”

## 14) Inputs the AI must request (blockers)
- `APP_STORE_URL` (App Store listing URL)
- Screenshots + desired screenshot order

