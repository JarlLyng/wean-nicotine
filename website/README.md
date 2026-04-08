# Wean Nicotine marketing site

Static Astro marketing site for **Wean Nicotine**, intended for GitHub Pages with custom domain `https://weannicotine.iamjarl.com`.

## Udvikling

```sh
npm install
npm run dev
```

## Localization (i18n)

The site uses Astro's built-in file-based i18n routing.

- **Default Locale:** English (`en`) at the root (`/`)
- **Supported Locales:** Danish (`da`), Swedish (`sv`), Norwegian (`no`) at `/da/`, `/sv/`, `/no/`
- **Translating Pages:** To localize a new page, duplicate the English `.astro` file into the target language's directory (e.g., `src/pages/sv/support.astro`) and translate the copy directly.
- **UI Strings:** Core UI strings (like navigation and footer labels) are managed in `src/i18n/ui.ts` and used via the `useTranslations` helper in `src/i18n/utils.ts`.

## Build

```sh
npm run build
npm run preview
```
