/**
 * The shared chart primitives, one item per module.
 *
 * Ported from `evilcharts/src/registry/registry-ui.ts`, with provider-specific LayerChart and
 * ECharts primitives.
 *
 * Each `path` is a **directory**: a Svelte primitive is a folder of `.svelte` files plus an
 * `index.ts` barrel, where the reference is a single `.tsx`. `scripts/build-registry.ts` expands a
 * directory into one file entry per source file, skipping tests.
 */
import type { RegistryItem } from './schema.js';
import { PACKAGE, withNotice } from './registry-dependencies.js';

const TARGET_BASE_PATH = '$lib/components/evilcharts/ui';

const primitives: RegistryItem[] = [
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
		dependencies: [PACKAGE.layerchart, PACKAGE.motion, PACKAGE.d3Shape, PACKAGE.d3ShapeTypes],
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
		registryDependencies: ['@evilcharts/layerchart-chart'],
		dependencies: [PACKAGE.layerchart],
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
		dependencies: [PACKAGE.layerchart],
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
		dependencies: [PACKAGE.layerchart],
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
		dependencies: [PACKAGE.layerchart, PACKAGE.motion],
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
		dependencies: [PACKAGE.layerchart],
		files: [
			{
				path: 'ui/layerchart-background',
				type: 'registry:component',
				target: TARGET_BASE_PATH + '/layerchart-background'
			}
		]
	},
	{
		name: 'echarts-chart',
		type: 'registry:component',
		dependencies: [PACKAGE.echarts],
		files: [
			{
				path: 'ui/echarts-chart',
				type: 'registry:component',
				target: TARGET_BASE_PATH + '/echarts-chart'
			}
		]
	},
	{
		name: 'echarts-dither',
		description: 'Ordered-dither paint helpers for ECharts, inspired by Dither Kit',
		type: 'registry:component',
		dependencies: [PACKAGE.echarts],
		files: [
			{
				path: 'ui/echarts-dither',
				type: 'registry:component',
				target: TARGET_BASE_PATH + '/echarts-dither'
			}
		]
	},
	{
		name: 'echarts-tooltip',
		type: 'registry:component',
		registryDependencies: ['@evilcharts/echarts-chart'],
		dependencies: [PACKAGE.echarts],
		files: [
			{
				path: 'ui/echarts-tooltip',
				type: 'registry:component',
				target: TARGET_BASE_PATH + '/echarts-tooltip'
			}
		]
	},
	{
		name: 'echarts-legend',
		type: 'registry:component',
		registryDependencies: ['@evilcharts/echarts-chart'],
		dependencies: [PACKAGE.echarts],
		files: [
			{
				path: 'ui/echarts-legend',
				type: 'registry:component',
				target: TARGET_BASE_PATH + '/echarts-legend'
			}
		]
	},
	{
		name: 'echarts-dot',
		type: 'registry:component',
		registryDependencies: ['@evilcharts/echarts-chart'],
		dependencies: [PACKAGE.echarts],
		files: [
			{
				path: 'ui/echarts-dot',
				type: 'registry:component',
				target: TARGET_BASE_PATH + '/echarts-dot'
			}
		]
	},
	{
		name: 'echarts-brush',
		type: 'registry:component',
		registryDependencies: ['@evilcharts/echarts-chart'],
		dependencies: [PACKAGE.echarts],
		files: [
			{
				path: 'ui/echarts-brush',
				type: 'registry:component',
				target: TARGET_BASE_PATH + '/echarts-brush'
			}
		]
	}
];

export const ui: RegistryItem[] = [
	{
		name: 'evilcharts-notice',
		description: 'EvilCharts SV upstream attribution and MIT licence notice',
		type: 'registry:file',
		files: [
			{
				path: 'NOTICE.md',
				type: 'registry:file',
				target: '$lib/components/evilcharts/NOTICE.md'
			}
		]
	},
	...withNotice(primitives)
];
