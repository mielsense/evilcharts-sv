import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';

/** Ported from `evilcharts/src/app/.well-known/skills/index.json/route.ts`. */
export const prerender = true;

export const GET: RequestHandler = () =>
	json({
		skills: [
			{
				name: 'evilcharts',
				description:
					'Add and customize EvilCharts chart components in shadcn-svelte and LayerChart projects.',
				files: ['skill.md']
			}
		]
	});
