/**
 * The eight chart modules.
 *
 * Ported from `evilcharts/src/registry/registry-chart.ts` — the recharts entries only, renamed to
 * the `layerchart` provider, with `recharts`/`motion` swapped for `layerchart` and
 * `@humanspeak/svelte-motion`. `registryDependencies` are kept exactly as the reference declares
 * them, per chart.
 *
 * Each `path` is a **directory**; `scripts/build-registry.ts` expands it into one entry per source
 * file while skipping tests.
 */
import type { RegistryItem } from './schema.js';
import { PACKAGE, withNotice } from './registry-dependencies.js';

const TARGET_BASE_PATH = '$lib/components/evilcharts/charts';

const chartItems: RegistryItem[] = [
	{
		name: 'layerchart-area-chart',
		description: 'Area chart component',
		registryDependencies: [
			'@evilcharts/layerchart-dither',
			'@evilcharts/layerchart-chart',
			'@evilcharts/layerchart-tooltip',
			'@evilcharts/layerchart-legend',
			'@evilcharts/layerchart-dot',
			'@evilcharts/layerchart-brush',
			'@evilcharts/layerchart-background'
		],
		dependencies: [PACKAGE.layerchart, PACKAGE.motion, PACKAGE.d3Scale, PACKAGE.d3ScaleTypes],
		type: 'registry:component',
		files: [
			{
				path: 'charts/layerchart-area-chart',
				type: 'registry:component',
				target: TARGET_BASE_PATH + '/layerchart-area-chart'
			}
		]
	},
	{
		name: 'layerchart-line-chart',
		description: 'Line chart component',
		registryDependencies: [
			'@evilcharts/layerchart-dither',
			'@evilcharts/layerchart-chart',
			'@evilcharts/layerchart-tooltip',
			'@evilcharts/layerchart-legend',
			'@evilcharts/layerchart-dot',
			'@evilcharts/layerchart-brush',
			'@evilcharts/layerchart-background'
		],
		dependencies: [PACKAGE.layerchart, PACKAGE.motion, PACKAGE.d3Scale, PACKAGE.d3ScaleTypes],
		type: 'registry:component',
		files: [
			{
				path: 'charts/layerchart-line-chart',
				type: 'registry:component',
				target: TARGET_BASE_PATH + '/layerchart-line-chart'
			}
		]
	},
	{
		name: 'layerchart-bar-chart',
		description: 'Bar chart component',
		registryDependencies: [
			'@evilcharts/layerchart-dither',
			'@evilcharts/layerchart-chart',
			'@evilcharts/layerchart-tooltip',
			'@evilcharts/layerchart-legend',
			'@evilcharts/layerchart-brush',
			'@evilcharts/layerchart-background'
		],
		dependencies: [PACKAGE.layerchart, PACKAGE.motion],
		type: 'registry:component',
		files: [
			{
				path: 'charts/layerchart-bar-chart',
				type: 'registry:component',
				target: TARGET_BASE_PATH + '/layerchart-bar-chart'
			}
		]
	},
	{
		name: 'layerchart-composed-chart',
		description: 'Composed chart component combining bar and line charts',
		registryDependencies: [
			'@evilcharts/layerchart-dither',
			'@evilcharts/layerchart-chart',
			'@evilcharts/layerchart-tooltip',
			'@evilcharts/layerchart-legend',
			'@evilcharts/layerchart-dot',
			'@evilcharts/layerchart-brush',
			'@evilcharts/layerchart-background'
		],
		dependencies: [PACKAGE.layerchart, PACKAGE.motion],
		type: 'registry:component',
		files: [
			{
				path: 'charts/layerchart-composed-chart',
				type: 'registry:component',
				target: TARGET_BASE_PATH + '/layerchart-composed-chart'
			}
		]
	},
	{
		name: 'layerchart-pie-chart',
		description: 'Pie chart component with donut, gradient, and glow effects',
		registryDependencies: [
			'@evilcharts/layerchart-dither',
			'@evilcharts/layerchart-chart',
			'@evilcharts/layerchart-tooltip',
			'@evilcharts/layerchart-legend',
			'@evilcharts/layerchart-background'
		],
		dependencies: [PACKAGE.layerchart, PACKAGE.motion],
		type: 'registry:component',
		files: [
			{
				path: 'charts/layerchart-pie-chart',
				type: 'registry:component',
				target: TARGET_BASE_PATH + '/layerchart-pie-chart'
			}
		]
	},
	{
		name: 'layerchart-radial-chart',
		description: 'Radial bar chart component with full and semi-circle variants',
		registryDependencies: [
			'@evilcharts/layerchart-chart',
			'@evilcharts/layerchart-tooltip',
			'@evilcharts/layerchart-legend',
			'@evilcharts/layerchart-background'
		],
		dependencies: [PACKAGE.layerchart, PACKAGE.motion],
		type: 'registry:component',
		files: [
			{
				path: 'charts/layerchart-radial-chart',
				type: 'registry:component',
				target: TARGET_BASE_PATH + '/layerchart-radial-chart'
			}
		]
	},
	{
		name: 'layerchart-radar-chart',
		description: 'Radar chart component with filled and lines variants',
		registryDependencies: [
			'@evilcharts/layerchart-dither',
			'@evilcharts/layerchart-chart',
			'@evilcharts/layerchart-tooltip',
			'@evilcharts/layerchart-legend',
			'@evilcharts/layerchart-dot',
			'@evilcharts/layerchart-background'
		],
		dependencies: [PACKAGE.layerchart, PACKAGE.motion, PACKAGE.d3Shape],
		type: 'registry:component',
		files: [
			{
				path: 'charts/layerchart-radar-chart',
				type: 'registry:component',
				target: TARGET_BASE_PATH + '/layerchart-radar-chart'
			}
		]
	},
	{
		name: 'layerchart-sankey-chart',
		description: 'Sankey chart component for visualizing flow data with nodes and links',
		registryDependencies: [
			'@evilcharts/layerchart-chart',
			'@evilcharts/layerchart-tooltip',
			'@evilcharts/layerchart-background'
		],
		dependencies: [PACKAGE.layerchart, PACKAGE.motion],
		type: 'registry:component',
		files: [
			{
				path: 'charts/layerchart-sankey-chart',
				type: 'registry:component',
				target: TARGET_BASE_PATH + '/layerchart-sankey-chart'
			}
		]
	}
];

export const charts: RegistryItem[] = withNotice(chartItems);
