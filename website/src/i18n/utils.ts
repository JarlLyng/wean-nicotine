import { ui, defaultLang, languages } from './ui';

export function getLangFromUrl(url: URL) {
  const [, lang] = url.pathname.split('/');
  if (lang in ui) return lang as keyof typeof ui;
  return defaultLang;
}

export function useTranslations(lang: keyof typeof ui) {
  return function t(key: keyof (typeof ui)[typeof defaultLang]) {
    return ui[lang][key] || ui[defaultLang][key];
  };
}

export function useTranslatedPath(lang: keyof typeof ui) {
  return function translatePath(path: string, l: string = lang) {
    const isDefault = l === defaultLang;
    // Special handling for the root index
    if (path === '/' || path === '') {
      return isDefault ? '/' : `/${l}/`;
    }

    // Ensure path starts with a slash and does not end with one unless it's just '/'
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    // If the path already has the language prefix, replace it or keep it as needed
    const segments = normalizedPath.split('/').filter(Boolean);
    if (segments.length > 0 && Object.keys(ui).includes(segments[0])) {
      segments.shift(); // Remove existing lang prefix
    }

    // Trailing slash on purpose: the host 301s /privacy to /privacy/ and the
    // sitemap lists the directory form, so emitting the bare path sends every
    // nav link, footer link, language-switcher link and hreflang through a
    // redirect. Astro builds these as `<route>/index.html`, so the directory
    // form is the real URL (#307).
    // Empty after stripping the prefix (e.g. "/da/" -> the root) must stay "/",
    // not "//", which is protocol-relative and breaks `new URL`.
    const unlocalizedPath = segments.length ? `/${segments.join('/')}/` : '/';

    return !isDefault ? `/${l}${unlocalizedPath}` : unlocalizedPath;
  };
}

/**
 * Where each language's version of this page is. A locale the page is not
 * available in links to that locale's home instead of the translated path,
 * which would 404; a guide whose translations live at other slugs links to
 * them (`translations`).
 */
export function languageLinks(
  url: URL,
  availableLocales: string[],
  translations?: Partial<Record<string, string>>,
) {
  const current = getLangFromUrl(url);
  const translatePath = useTranslatedPath(current);
  return Object.entries(languages).map(([code, label]) => {
    const href =
      translations?.[code] ??
      (availableLocales.includes(code)
        ? translatePath(url.pathname, code)
        : code === defaultLang
          ? '/'
          : `/${code}/`);
    return { code, label, href, isCurrent: code === current };
  });
}
