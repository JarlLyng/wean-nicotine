// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { gitLastmod, lastmodFor } from './scripts/git-lastmod.mjs';

// https://astro.build/config
export default defineConfig({
	site: 'https://weannicotine.iamjarl.com',
	integrations: [
		sitemap({
			// Each page's <lastmod> is the last commit to its own content, never
			// the build date (#415). See scripts/git-lastmod.mjs.
			serialize(item) {
				item.lastmod = lastmodFor(item.url);
				return item;
			},
			// Emit <xhtml:link rel="alternate"> entries so Google can corroborate
			// the hreflang signals on each page. Default locale is served at root
			// (no /en prefix), matching i18n.routing below.
			i18n: {
				defaultLocale: 'en',
				locales: {
					en: 'en',
					da: 'da',
					sv: 'sv',
					no: 'no',
				},
			},
		}),
		// After sitemap(), so its check reads the sitemap that was written.
		gitLastmod(),
	],
	i18n: {
		defaultLocale: 'en',
		locales: ['en', 'da', 'sv', 'no'],
		routing: {
			prefixDefaultLocale: false,
		},
	},
});
