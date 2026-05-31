// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
	site: 'https://weannicotine.iamjarl.com',
	integrations: [
		sitemap({
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
	],
	i18n: {
		defaultLocale: 'en',
		locales: ['en', 'da', 'sv', 'no'],
		routing: {
			prefixDefaultLocale: false,
		},
	},
});
