/**
 * The shared chart primitives, one item per module.
 *
 * Ported from `evilcharts/src/registry/registry-ui.ts` — the recharts entries only, renamed to the
 * `layerchart` provider. The ECharts half of the reference has no counterpart here.
 *
 * Each `path` is a **directory**: a Svelte primitive is a folder of `.svelte` files plus an
 * `index.ts` barrel, where the reference is a single `.tsx`. `scripts/build-registry.ts` expands a
 * directory into one file entry per source file, skipping tests. See plans/DEVIATIONS.md R-1.
 */
import type { RegistryItem } from './schema.js';

const TARGET_BASE_PATH = '$lib/components/evilcharts/ui';

export const ui: RegistryItem[] = [
	{
		name: 'layerchart-dither',
		description: 'Independent ordered-dither renderer inspired by Dither Kit',
		type: 'registry:component',
		files: [
			{
				path: 'ui/layerchart-dither',
				type: 'registry:component',
				target: TARGET_BASE_PATH + '/layerchart-dither'
			}
		]
	},
	{
		name: 'layerchart-chart',
		type: 'registry:component',
		dependencies: ['layerchart', 'd3-shape'],
		files: [
			{
				path: 'ui/layerchart-chart',
				type: 'registry:component',
				target: TARGET_BASE_PATH + '/layerchart-chart'
			}
		]
	},
	{
		name: 'layerchart-tooltip',
		type: 'registry:component',
		dependencies: ['layerchart'],
		files: [
			{
				path: 'ui/layerchart-tooltip',
				type: 'registry:component',
				target: TARGET_BASE_PATH + '/layerchart-tooltip'
			}
		]
	},
	{
		name: 'layerchart-legend',
		type: 'registry:component',
		dependencies: ['layerchart'],
		files: [
			{
				path: 'ui/layerchart-legend',
				type: 'registry:component',
				target: TARGET_BASE_PATH + '/layerchart-legend'
			}
		]
	},
	{
		name: 'layerchart-dot',
		type: 'registry:component',
		dependencies: ['layerchart'],
		files: [
			{
				path: 'ui/layerchart-dot',
				type: 'registry:component',
				target: TARGET_BASE_PATH + '/layerchart-dot'
			}
		]
	},
	{
		name: 'layerchart-brush',
		type: 'registry:component',
		registryDependencies: ['@evilcharts/layerchart-chart'],
		dependencies: ['layerchart', '@humanspeak/svelte-motion'],
		files: [
			{
				path: 'ui/layerchart-brush',
				type: 'registry:component',
				target: TARGET_BASE_PATH + '/layerchart-brush'
			}
		]
	},
	{
		name: 'layerchart-background',
		type: 'registry:component',
		dependencies: ['layerchart'],
		files: [
			{
				path: 'ui/layerchart-background',
				type: 'registry:component',
				target: TARGET_BASE_PATH + '/layerchart-background'
			}
		]
	}
];
