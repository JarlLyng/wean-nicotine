import { ui, defaultLang } from './ui';

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

		const unlocalizedPath = `/${segments.join('/')}`;
		
		return !isDefault ? `/${l}${unlocalizedPath}` : unlocalizedPath;
	};
}
