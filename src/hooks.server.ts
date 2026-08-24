import type { Handle, HandleServerError } from '@sveltejs/kit';
import { ingest } from '$site/lib/axiom.js';

/**
 * Logs the real error server-side. SvelteKit only sends a generic message to the browser, which
 * makes a failing docs page opaque.
 */
export const handleError: HandleServerError = ({ error, event }) => {
	console.error(`[error] ${event.url.pathname}`, error);
	return { message: 'Internal Error' };
};

/**
 * Ported from `evilcharts/src/proxy.ts`, which runs on `/docs/:path*` and `/r/:path*`:
 *
 * - a registry install (`/r/<name>.json`) is recorded and passed through;
 * - a `/docs/…` request that asks for `Accept: text/markdown` is served the markdown mirror
 *   instead of the HTML page.
 *
 * The reference rewrites onto `/llm/<slug>`; the mirror lives at `/docs/<slug>.md` here, so that is
 * what gets served — through `event.fetch`, which resolves internally rather than over the network.
 * Both branches are no-ops when Axiom is unconfigured.
 */
export const handle: Handle = async ({ event, resolve }) => {
	const { pathname } = event.url;
	const accept = event.request.headers.get('accept')?.toLowerCase() ?? '';

	const context = {
		userAgent: event.request.headers.get('user-agent'),
		country: event.request.headers.get('x-vercel-ip-country'),
		referer: event.request.headers.get('referer')
	};

	if (pathname.startsWith('/r/') && pathname.endsWith('.json')) {
		void ingest([
			{
				event: 'registry_install',
				component: pathname.slice('/r/'.length, -'.json'.length),
				...context
			}
		]);
		return resolve(event);
	}

	const wantsMarkdown =
		pathname.startsWith('/docs') && accept.includes('text/markdown') && !pathname.endsWith('.md');

	if (!wantsMarkdown) {
		const response = await resolve(event);
		if (pathname.startsWith('/docs')) response.headers.append('Vary', 'Accept');
		return response;
	}

	const slug = pathname.replace(/^\/docs\/?/, '');
	void ingest([{ event: 'docs_markdown_fetch', slug: slug || 'index', ...context }]);

	// `/docs` → `/docs.md`; `/docs/<slug>` → `/docs/<slug>.md`.
	return event.fetch(slug ? `/docs/${slug}.md` : '/docs.md');
};
