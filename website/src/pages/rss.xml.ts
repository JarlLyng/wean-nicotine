import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_NAME } from '../lib/site';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
	const posts = (
		await getCollection('blog', ({ data }) => data.published !== false)
	).sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());

	return rss({
		title: `${SITE_NAME} — Blog`,
		description:
			'Notes on tapering nicotine pouches, privacy-first health apps, and building Wean Nicotine as a solo indie.',
		site: context.site ?? 'https://weannicotine.iamjarl.com',
		items: posts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.pubDate,
			link: `/blog/${post.id}/`,
			author: post.data.author,
			categories: post.data.tags,
		})),
		customData: '<language>en-us</language>',
	});
}
