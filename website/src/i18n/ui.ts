export const languages = {
  en: 'English',
  da: 'Dansk',
  sv: 'Svenska',
  no: 'Norsk',
};

export const defaultLang = 'en';

/**
 * Every locale the site ships. Pass as `availableLocales` on pages that really
 * are translated at the same slug in all of them (the homepages, privacy and
 * support). Layout defaults to the page's own locale, so anything else is
 * claimed only where it exists. See Layout.astro's `availableLocales` doc.
 */
export const ALL_LOCALES = Object.keys(languages);

export const ui = {
  en: {
    'nav.privacy': 'Privacy',
    'nav.support': 'Support',
    'footer.tagline': 'Calm, local-first progress tracking.',
    'cta.appstore': 'Download on the App Store',
    'cta.comingsoon': 'Coming soon on the App Store',
  },
  da: {
    'nav.privacy': 'Privatliv',
    'nav.support': 'Support',
    'footer.tagline': 'Rolig, lokal fremgangssporing.',
    'cta.appstore': 'Hent i App Store',
    'cta.comingsoon': 'Kommer snart i App Store',
  },
  sv: {
    'nav.privacy': 'Integritet',
    'nav.support': 'Support',
    'footer.tagline': 'Lugn, lokal spårning av framsteg.',
    'cta.appstore': 'Hämta i App Store',
    'cta.comingsoon': 'Kommer snart i App Store',
  },
  no: {
    'nav.privacy': 'Personvern',
    'nav.support': 'Support',
    'footer.tagline': 'Rolig, lokal fremdriftssporing.',
    'cta.appstore': 'Last ned i App Store',
    'cta.comingsoon': 'Kommer snart i App Store',
  },
} as const;
