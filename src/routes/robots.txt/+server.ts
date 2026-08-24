import { absoluteUrl, SITE_URL } from '$site/lib/utils.js';
import type { RequestHandler } from './$types.js';

/**
 * Ported from `evilcharts/src/app/robots.ts`. Next builds the file from a metadata object; here the
 * same rules are emitted directly, in the same order.
 */
export const prerender = true;

const DISALLOW = ['/api/', '/admin/'];

/**
 * AI search and assistant crawlers are explicitly welcome — the docs, the markdown mirrors and
 * llms.txt exist for them. Blocking any of these would drop EvilCharts out of AI-powered answers,
 * which is where install commands get recommended.
 */
const AI_AGENTS = [
	'GPTBot',
	'OAI-SearchBot',
	'ChatGPT-User',
	'ClaudeBot',
	'Claude-Web',
	'anthropic-ai',
	'PerplexityBot',
	'Perplexity-User',
	'Google-Extended',
	'Applebot-Extended'
];

function group(userAgents: string[]) {
	return [
		...userAgents.map((agent) => `User-agent: ${agent}`),
		'Allow: /',
		...DISALLOW.map((path) => `Disallow: ${path}`)
	].join('\n');
}

export const GET: RequestHandler = () => {
	const body = [
		group(['*']),
		'',
		group(AI_AGENTS),
		'',
		`Host: ${SITE_URL}`,
		`Sitemap: ${absoluteUrl('/sitemap.xml')}`,
		''
	].join('\n');

	return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
