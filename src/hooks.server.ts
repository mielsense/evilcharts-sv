import type { Handle, HandleServerError } from '@sveltejs/kit';
import { waitUntil } from '@vercel/functions';
import { ingest, sanitizeAnalyticsContext } from '$site/lib/axiom.js';

type MediaRange = {
	type: string;
	subtype: string;
	quality: number;
	specificity: number;
};

function isDocsPath(pathname: string): boolean {
	return pathname === '/docs' || pathname.startsWith('/docs/');
}

/** Keep best-effort analytics alive after Vercel sends the response. */
function scheduleAnalytics(events: Record<string, unknown>[]): void {
	const task = ingest(events);
	try {
		waitUntil(task);
	} catch {
		// Local and non-Vercel runtimes have no request lifetime to extend.
		void task;
	}
}

function parseAccept(accept: string): MediaRange[] {
	return accept.split(',').flatMap((value) => {
		const [mediaType = '', ...parameters] = value.split(';');
		const [type, subtype, ...extra] = mediaType.trim().toLowerCase().split('/');
		if (!type || !subtype || extra.length > 0) return [];

		let quality = 1;
		for (const parameter of parameters) {
			const [name, rawValue] = parameter.trim().split('=', 2);
			if (name?.toLowerCase() !== 'q') continue;
			const value = rawValue?.trim() ?? '';
			quality = /^(?:0(?:\.\d{0,3})?|1(?:\.0{0,3})?)$/.test(value) ? Number(value) : 0;
			break;
		}

		const specificity = type === '*' ? 0 : subtype === '*' ? 1 : 2;
		return [{ type, subtype, quality, specificity }];
	});
}

function qualityFor(ranges: MediaRange[], type: string, subtype: string): number {
	let quality = 0;
	let specificity = -1;

	for (const range of ranges) {
		if (range.type !== '*' && range.type !== type) continue;
		if (range.subtype !== '*' && range.subtype !== subtype) continue;
		if (range.specificity <= specificity) continue;
		specificity = range.specificity;
		quality = range.quality;
	}

	return quality;
}

function prefersMarkdown(accept: string): boolean {
	const ranges = parseAccept(accept);
	const markdownQuality = qualityFor(ranges, 'text', 'markdown');
	const htmlQuality = qualityFor(ranges, 'text', 'html');
	return markdownQuality > 0 && markdownQuality > htmlQuality;
}

function varyOnAccept(response: Response): Response {
	const values = (response.headers.get('Vary') ?? '').split(',').map((value) => value.trim());
	if (values.some((value) => ['*', 'accept'].includes(value.toLowerCase()))) return response;

	const headers = new Headers(response.headers);
	headers.append('Vary', 'Accept');
	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers
	});
}

/**
 * `event.fetch` may decode a compressed internal response while retaining its transport headers.
 * Do not tell the outer client to decompress an already-decoded Markdown body.
 */
function stripDecodedBodyHeaders(response: Response): Response {
	if (!response.headers.has('Content-Encoding') && !response.headers.has('Content-Length')) {
		return response;
	}

	const headers = new Headers(response.headers);
	headers.delete('Content-Encoding');
	headers.delete('Content-Length');
	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers
	});
}

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
	const accept = event.request.headers.get('accept') ?? '';

	const context = sanitizeAnalyticsContext({
		userAgent: event.request.headers.get('user-agent'),
		country: event.request.headers.get('x-vercel-ip-country'),
		referer: event.request.headers.get('referer')
	});

	if (pathname.startsWith('/r/') && pathname.endsWith('.json')) {
		scheduleAnalytics([
			{
				event: 'registry_install',
				component: pathname.slice('/r/'.length, -'.json'.length),
				...context
			}
		]);
		return resolve(event);
	}

	const isDocs = isDocsPath(pathname);
	const wantsMarkdown = isDocs && prefersMarkdown(accept) && !pathname.endsWith('.md');

	if (!wantsMarkdown) {
		const response = await resolve(event);
		return isDocs ? varyOnAccept(response) : response;
	}

	const slug = pathname.replace(/^\/docs\/?/, '');
	scheduleAnalytics([{ event: 'docs_markdown_fetch', slug: slug || 'index', ...context }]);

	// `/docs` → `/docs.md`; `/docs/<slug>` → `/docs/<slug>.md`.
	const markdown = await event.fetch(slug ? `/docs/${slug}.md` : '/docs.md');
	return varyOnAccept(stripDecodedBodyHeaders(markdown));
};
