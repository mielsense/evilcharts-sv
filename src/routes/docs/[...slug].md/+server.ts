import { error } from '@sveltejs/kit';
import { getPage, getPages } from '$site/lib/source.server.js';
import { processMdxForLLMs } from '$site/lib/llm.js';
import type { EntryGenerator, RequestHandler } from './$types.js';

/**
 * The markdown mirror of every docs page.
 *
 * The reference reaches this through a `next.config.ts` rewrite of `/docs/**.md` onto
 * `src/app/llm/[[...slug]]`; SvelteKit matches the `.md` suffix in the route name directly, so no
 * rewrite hook is needed. `/docs.md` is handled by its own route, as `/docs` has an empty slug.
 */
export const prerender = true;

export const entries: EntryGenerator = () =>
	getPages()
		.filter((page) => page.slugs.length > 0)
		.map((page) => ({ slug: page.slugs.join('/') }));

export const GET: RequestHandler = ({ params }) => {
	const page = getPage(params.slug ? params.slug.split('/') : []);
	if (!page) error(404, 'Not found');

	return new Response(processMdxForLLMs(page.body), {
		headers: { 'Content-Type': 'text/markdown; charset=utf-8', Vary: 'Accept' }
	});
};
