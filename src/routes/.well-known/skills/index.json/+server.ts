import { json } from '@sveltejs/kit';
import { getSkillsIndex } from '$site/lib/agent-docs.js';
import type { RequestHandler } from './$types.js';

/** Ported from `evilcharts/src/app/.well-known/skills/index.json/route.ts`. */
export const prerender = true;

export const GET: RequestHandler = () => json(getSkillsIndex());
