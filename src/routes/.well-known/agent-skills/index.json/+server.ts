import { json } from '@sveltejs/kit';
import { getAgentSkillsIndex } from '$site/lib/agent-docs.js';
import type { RequestHandler } from './$types.js';

/** Ported from `evilcharts/src/app/.well-known/agent-skills/index.json/route.ts`. */
export const prerender = true;

export const GET: RequestHandler = () => json(getAgentSkillsIndex());
