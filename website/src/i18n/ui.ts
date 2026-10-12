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
    'nav.skip': 'Skip to content',
    'nav.label': 'Main',
    'nav.how': 'How it works',
    'nav.plan': 'The plan',
    'nav.faq': 'Questions',
    'nav.language': 'Language',
    'nav.privacy': 'Privacy',
    'nav.support': 'Support',
    'nav.blog': 'Blog',
    'footer.tagline': 'Calm, local-first progress tracking.',
  },
  da: {
    'nav.skip': 'Gå til indhold',
    'nav.label': 'Hovedmenu',
    'nav.how': 'Sådan virker det',
    'nav.plan': 'Planen',
    'nav.faq': 'Spørgsmål',
    'nav.language': 'Sprog',
    'nav.privacy': 'Privatliv',
    'nav.support': 'Support',
    'nav.blog': 'Blog (engelsk)',
    'footer.tagline': 'Rolig, lokal fremgangssporing.',
  },
  sv: {
    'nav.skip': 'Till innehållet',
    'nav.label': 'Huvudmeny',
    'nav.how': 'Så fungerar det',
    'nav.plan': 'Planen',
    'nav.faq': 'Frågor',
    'nav.language': 'Språk',
    'nav.privacy': 'Integritet',
    'nav.support': 'Support',
    'nav.blog': 'Blogg (engelska)',
    'footer.tagline': 'Lugn, lokal spårning av framsteg.',
  },
  no: {
    'nav.skip': 'Gå til innhold',
    'nav.label': 'Hovedmeny',
    'nav.how': 'Slik fungerer det',
    'nav.plan': 'Planen',
    'nav.faq': 'Spørsmål',
    'nav.language': 'Språk',
    'nav.privacy': 'Personvern',
    'nav.support': 'Support',
    'nav.blog': 'Blogg (engelsk)',
    'footer.tagline': 'Rolig, lokal fremdriftssporing.',
  },
} as const;
