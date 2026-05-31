import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Blog collection — Markdown posts under `src/content/blog/*.md`.
 *
 * Filename becomes the slug. Frontmatter is validated below; missing fields
 * fail the build with a useful Zod error so we never publish a half-written
 * post.
 */
const blog = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		author: z.string().default('Jarl Lyng'),
		/** Show the post in listings + RSS. Set false to soft-unpublish. */
		published: z.boolean().default(true),
		/** Free-form tags surfaced in the listing and OG. */
		tags: z.array(z.string()).default([]),
		/** Optional cover/social image relative to /public (or a full URL). */
		coverImage: z.string().optional(),
	}),
});

export const collections = { blog };
