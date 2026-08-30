import { generateSkillReference } from '$site/lib/agent-docs.js';
import type { RequestHandler } from './$types.js';

export const prerender = true;

export const GET: RequestHandler = () =>
	new Response(generateSkillReference('chart-catalog.md'), {
		headers: { 'Content-Type': 'text/markdown; charset=utf-8' }
	});
