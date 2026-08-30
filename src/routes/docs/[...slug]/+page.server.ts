import { error } from '@sveltejs/kit';
import { findNeighbour, getPage } from '$site/lib/source.server.js';
import type { PageServerLoad } from './$types.js';

/** Dynamic so the server hook can negotiate HTML and Markdown from the same canonical URL. */
export const prerender = false;

export const load: PageServerLoad = async ({ params }) => {
	const slugs = params.slug ? params.slug.split('/') : [];
	const page = getPage(slugs);
	if (!page) error(404, 'Not found');

	const { previous, next } = findNeighbour(page.url);

	return {
		/* The selected authored body remains available to the Copy Page control. */
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
