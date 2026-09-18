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
    'nav.skip': 'Skip to content',
    'nav.toggle': 'Toggle menu',
    'nav.blog': 'Blog',
    'footer.more': 'More from IAMJARL',
  },
  da: {
    'nav.privacy': 'Privatliv',
    'nav.support': 'Support',
    'footer.tagline': 'Rolig, lokal fremgangssporing.',
    'cta.appstore': 'Hent i App Store',
    'cta.comingsoon': 'Kommer snart i App Store',
    'nav.skip': 'Gå til indhold',
    'nav.toggle': 'Vis/skjul menu',
    'nav.blog': 'Blog (engelsk)',
    'footer.more': 'Mere fra IAMJARL',
  },
  sv: {
    'nav.privacy': 'Integritet',
    'nav.support': 'Support',
    'footer.tagline': 'Lugn, lokal spårning av framsteg.',
    'cta.appstore': 'Hämta i App Store',
    'cta.comingsoon': 'Kommer snart i App Store',
    'nav.skip': 'Till innehållet',
    'nav.toggle': 'Visa/dölj meny',
    'nav.blog': 'Blogg (engelska)',
    'footer.more': 'Mer från IAMJARL',
  },
  no: {
    'nav.privacy': 'Personvern',
    'nav.support': 'Support',
    'footer.tagline': 'Rolig, lokal fremdriftssporing.',
    'cta.appstore': 'Last ned i App Store',
    'cta.comingsoon': 'Kommer snart i App Store',
    'nav.skip': 'Gå til innhold',
    'nav.toggle': 'Vis/skjul meny',
    'nav.blog': 'Blogg (engelsk)',
    'footer.more': 'Mer fra IAMJARL',
  },
} as const;
