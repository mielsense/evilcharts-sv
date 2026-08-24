import { error } from '@sveltejs/kit';
import { findNeighbour, getPage } from '$site/lib/source.js';
import type { PageLoad } from './$types.js';

/** Dynamic so the server hook can negotiate HTML and Markdown from the same canonical URL. */
export const prerender = false;

export const load: PageLoad = async ({ params }) => {
	const slugs = params.slug ? params.slug.split('/') : [];
	const page = getPage(slugs);
	if (!page) error(404, 'Not found');

	const { previous, next } = findNeighbour(page.url);
	const module = await page.load();

	return {
		content: module.default,
		/*
			The raw markdown, for the "Copy Page" control. The reference passes it through
			`processMdxForLLMs` for machine-readable responses; the page control intentionally receives
			the authored body instead.
		*/
		markdown: page.body,
		data: page.data,
		url: page.url,
		file: page.file,
		toc: page.toc,
		neighbours: {
			previous: previous && {
				url: previous.url,
				title: previous.data.title,
				description: previous.data.description
			},
			next: next && { url: next.url, title: next.data.title, description: next.data.description }
		}
	};
};
