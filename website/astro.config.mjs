// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
	site: 'https://taper.iamjarl.com',
	integrations: [sitemap()],
	i18n: {
		defaultLocale: 'en',
		locales: ['en', 'da', 'sv', 'no'],
		routing: {
			prefixDefaultLocale: false,
		},
	},
});
