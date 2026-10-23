/**
 * The sitemap's <lastmod>, from git (#415).
 *
 * Each URL is dated by the last commit that touched the files its content
 * comes from: the page's own .astro file, a post's Markdown, and for the four
 * homes the kit page, its copy and its pictures. The shared frame (Layout, the
 * nav, the footer, the guides list, the stylesheets) does not move a page's
 * date. lastmod says when a page's content changed, and a restyle would
 * otherwise date every page the same day. On main that commit is the PR's
 * squash merge, so the date is the day the change went live.
 *
 * Never the build date. A date that is wrong for most pages is worse than none,
 * because Google stops trusting the field. So the build refuses a shallow clone,
 * where every file's last commit is the one commit there is, and a URL whose
 * source cannot be named fails the build rather than going out undated.
 *
 * Wired up in astro.config.mjs. @astrojs/sitemap catches an error thrown in
 * serialize() and then writes no sitemap at all, without failing the build, so
 * lastmodFor() never throws; it records the problem, and the integration below
 * throws once the sitemap is written.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const WEBSITE = fileURLToPath(new URL('..', import.meta.url));

/** What the four homes are made of, besides their own index.astro. */
const HOME_SOURCES = [
	'src/components/KitHome.astro',
	'src/i18n/home-copy.ts',
	'src/assets/site',
];
const HOMES = new Set(['', 'da', 'sv', 'no']);

const problems = [];
const uncommitted = new Set();

function git(args) {
	return execFileSync('git', args, { cwd: WEBSITE, encoding: 'utf8' }).trim();
}

/** The files a URL's content comes from, relative to website/, or null. */
function sourcesFor(pathname) {
	const p = pathname.replace(/^\/+|\/+$/g, '');
	if (HOMES.has(p)) return [join('src/pages', p, 'index.astro'), ...HOME_SOURCES];
	// The blog index lists every post's title and description.
	if (p === 'blog') return ['src/pages/blog/index.astro', 'src/content/blog'];
	if (p.startsWith('blog/')) return [`src/content/blog/${p.slice('blog/'.length)}.md`];
	for (const file of [join('src/pages', p, 'index.astro'), `src/pages/${p}.astro`]) {
		if (existsSync(join(WEBSITE, file))) return [file];
	}
	return null;
}

/** The committer date of the last commit to a URL's sources, or undefined. */
export function lastmodFor(url) {
	const { pathname } = new URL(url);
	const sources = sourcesFor(pathname);
	const missing = sources?.filter((file) => !existsSync(join(WEBSITE, file)));
	if (!sources || missing.length) {
		problems.push(`${pathname}: no source file to date it by (${missing?.join(', ') ?? 'unmapped'})`);
		return undefined;
	}
	let date;
	try {
		date = git(['log', '-1', '--format=%cI', '--', ...sources]);
	} catch (err) {
		problems.push(`${pathname}: git log failed (${err.message})`);
		return undefined;
	}
	// Empty for a page not committed yet, which only happens in a local build.
	// It goes out undated, which is true, and is not a problem.
	if (!date) uncommitted.add(url);
	return date || undefined;
}

/** Fails the build when the sitemap could not be dated truthfully. */
export function gitLastmod() {
	return {
		name: 'git-lastmod',
		hooks: {
			'astro:build:start': () => {
				if (git(['rev-parse', '--is-shallow-repository']) === 'true') {
					throw new Error(
						'git-lastmod: shallow clone, so every page would get the same date. ' +
							'Check out with full history (fetch-depth: 0).',
					);
				}
			},
			// Runs after @astrojs/sitemap's, since it is listed after it.
			'astro:build:done': ({ dir, logger }) => {
				const out = fileURLToPath(dir);
				const sitemaps = readdirSync(out).filter((f) => /^sitemap-\d+\.xml$/.test(f));
				if (sitemaps.length === 0) problems.push('no sitemap was written (see the sitemap error above)');
				for (const file of sitemaps) {
					for (const m of readFileSync(join(out, file), 'utf8').matchAll(/<url>([\s\S]*?)<\/url>/g)) {
						const loc = m[1].match(/<loc>([^<]*)<\/loc>/)?.[1];
						if (!m[1].includes('<lastmod>') && !uncommitted.has(loc)) problems.push(`${loc}: no <lastmod>`);
					}
				}
				for (const url of uncommitted) logger.warn(`${url} has no commit yet, so it goes out without <lastmod>`);
				if (problems.length) {
					throw new Error(`git-lastmod: the sitemap is not dated truthfully\n  ${problems.join('\n  ')}`);
				}
			},
		},
	};
}
