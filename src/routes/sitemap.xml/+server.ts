import { absoluteUrl } from '$site/lib/utils.js';
import { getPages } from '$site/lib/source.js';
import type { RequestHandler } from './$types.js';

/**
 * Ported from `evilcharts/src/app/sitemap.ts`. Next serialises its metadata object into XML; here
 * the same entries — same URLs, same priorities, same de-duplication — are written out directly.
 *
 * `lastModified` is the build time, as `new Date()` is in the reference.
 */
export const prerender = true;

type Entry = { url: string; priority: number };

export const GET: RequestHandler = () => {
	const now = new Date().toISOString();

	const staticEntries: Entry[] = [
		{ url: absoluteUrl('/'), priority: 1 },
		{ url: absoluteUrl('/docs'), priority: 1 }
	];

	const docsEntries: Entry[] = getPages().map((page) => {
		const segments = page.slugs.length;
		return {
			url: absoluteUrl(page.url),
			priority: segments === 0 ? 0.9 : segments === 1 ? 0.8 : 0.7
		};
	});

	const seen = new Set<string>();
	const entries = [...staticEntries, ...docsEntries].filter((entry) => {
		if (seen.has(entry.url)) return false;
		seen.add(entry.url);
		return true;
	});

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
	.map(
		(entry) => `\t<url>
\t\t<loc>${entry.url}</loc>
\t\t<lastmod>${now}</lastmod>
\t\t<changefreq>weekly</changefreq>
\t\t<priority>${entry.priority}</priority>
\t</url>`
	)
	.join('\n')}
</urlset>
`;

	return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
