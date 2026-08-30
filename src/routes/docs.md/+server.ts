import { error } from '@sveltejs/kit';
import { getPage } from '$site/lib/source.server.js';
import { processMdxForLLMs } from '$site/lib/llm.js';
import type { RequestHandler } from './$types.js';

/**
 * `/docs.md` — the docs index as markdown. Its own route because `/docs` has an empty slug, which
 * is the same reason the reference's rewrite maps it separately.
 */
export const prerender = true;

export const GET: RequestHandler = () => {
	const page = getPage([]);
	if (!page) error(404, 'Not found');

	return new Response(processMdxForLLMs(page.body), {
		headers: { 'Content-Type': 'text/markdown; charset=utf-8', Vary: 'Accept' }
	});
};
