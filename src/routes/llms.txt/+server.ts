import { generateLlmsTxt } from '$site/lib/agent-docs.js';
import type { RequestHandler } from './$types.js';

/** Ported from `evilcharts/src/app/llms.txt/route.ts` (`dynamic = 'force-static'`). */
export const prerender = true;

export const GET: RequestHandler = () =>
	new Response(generateLlmsTxt(), {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' }
	});
