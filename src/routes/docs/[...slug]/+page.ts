import { error } from '@sveltejs/kit';
import { findNeighbour, getPage, getPages } from '$site/lib/source.js';
import type { EntryGenerator, PageLoad } from './$types.js';

/** Prerendered: the docs are static content, as they are in the reference's `generateStaticParams`. */
export const prerender = true;

export const entries: EntryGenerator = () =>
	getPages().map((page) => ({ slug: page.slugs.join('/') }));

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
			`processMdxForLLMs` first; that lives in Plan 13's agent surfaces, and this hands over the
			same body either way.
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
