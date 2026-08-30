import { generateSkillMd } from '$site/lib/agent-docs.js';
import type { RequestHandler } from './$types.js';

export const prerender = true;

export const GET: RequestHandler = () =>
	new Response(generateSkillMd(), {
		headers: { 'Content-Type': 'text/markdown; charset=utf-8' }
	});
