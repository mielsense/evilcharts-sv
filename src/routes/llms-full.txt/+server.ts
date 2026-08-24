import { generateLlmsFullTxt } from '$site/lib/agent-docs.js';
import type { RequestHandler } from './$types.js';

/** Ported from `evilcharts/src/app/llms-full.txt/route.ts`. */
export const prerender = true;

export const GET: RequestHandler = () =>
	new Response(generateLlmsFullTxt(), {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' }
	});
