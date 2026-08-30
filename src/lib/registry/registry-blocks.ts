/**
 * Installable, full-card chart compositions.
 *
 * Translated from the original Recharts and ECharts block catalogs, with Svelte compositions for
 * chart families that had no upstream block. Reference data and copy stay intact where available;
 * LayerChart and Svelte motion replace the React layers, while ECharts remains the rendering engine
 * for its provider's blocks.
 *
 * A few bar blocks split custom shapes into child files. Those children are listed beside their
 * entry point because the flat block directory also drives the docs preview lookup.
 */
import type { RegistryItem } from './schema.js';
import { withNotice } from './registry-dependencies.js';

const TARGET_BASE_PATH = '$lib/components/evilcharts/blocks';

/** One `registry:block` file entry per source file, keeping the block's own file names. */
function files(...names: string[]): RegistryItem['files'] {
	return names.map((name) => ({
		path: `blocks/layerchart/${name}.svelte`,
		type: 'registry:block' as const,
		target: `${TARGET_BASE_PATH}/${name.replace(/^b-/, '')}.svelte`
	}));
}

function echartsFiles(name: string): RegistryItem['files'] {
	return [
		{
			path: `blocks/echarts/${name}.svelte`,
			type: 'registry:block',
			target: `${TARGET_BASE_PATH}/${name.replace(/^b-/, '')}.svelte`
		}
	];
}

const blockItems: RegistryItem[] = [
	{
		name: 'latency-area-chart',
		description: 'Selectable P99, P95, P75 and P50 latency dashboard',
		dependencies: ['layerchart', '@humanspeak/svelte-motion', 'd3-scale'],
		registryDependencies: ['@evilcharts/layerchart-area-chart'],
		type: 'registry:block',
		files: files('b-latency-area-chart')
	},
	{
		name: 'portfolio-area-chart',
		description: 'Portfolio comparison with stepped dotted areas and return metrics',
		dependencies: ['layerchart', '@humanspeak/svelte-motion', 'd3-scale'],
		registryDependencies: ['@evilcharts/layerchart-area-chart'],
		type: 'registry:block',
		files: files('b-portfolio-area-chart')
	},
	{
		name: 'benchmark-area-chart',
		description: 'Weekly signups benchmark with actual and target series',
		dependencies: ['layerchart', '@humanspeak/svelte-motion', 'd3-scale'],
		registryDependencies: ['@evilcharts/layerchart-area-chart'],
		type: 'registry:block',
		files: files('b-benchmark-area-chart')
	},
	{
		name: 'audience-area-chart',
		description: 'Audience reach card with a compact total and gradient trend',
		dependencies: ['layerchart', '@humanspeak/svelte-motion', 'd3-scale'],
		registryDependencies: ['@evilcharts/layerchart-area-chart'],
		type: 'registry:block',
		files: files('b-audience-area-chart')
	},
	{
		name: 'payouts-line-chart',
		description: 'Payout trend with monthly, yearly and city totals',
		dependencies: ['layerchart', '@humanspeak/svelte-motion', 'd3-scale'],
		registryDependencies: ['@evilcharts/layerchart-line-chart'],
		type: 'registry:block',
		files: files('b-payouts-line-chart')
	},
	{
		name: 'shipments-line-chart',
		description: 'Current and previous week shipment comparison',
		dependencies: ['layerchart', '@humanspeak/svelte-motion', 'd3-scale'],
		registryDependencies: ['@evilcharts/layerchart-line-chart'],
		type: 'registry:block',
		files: files('b-shipments-line-chart')
	},
	{
		name: 'revenue-composed-chart',
		description: 'Annual revenue bars with a monthly profit trend and margin summary',
		dependencies: ['layerchart', '@humanspeak/svelte-motion'],
		registryDependencies: ['@evilcharts/layerchart-composed-chart'],
		type: 'registry:block',
		files: files('b-revenue-composed-chart')
	},
	{
		name: 'signups-composed-chart',
		description: 'Weekly signup bars measured against a stepped target line',
		dependencies: ['layerchart', '@humanspeak/svelte-motion'],
		registryDependencies: ['@evilcharts/layerchart-composed-chart'],
		type: 'registry:block',
		files: files('b-signups-composed-chart')
	},
	{
		name: 'monospace-bar-chart',
		description: 'Monospace bar chart component',
		dependencies: ['layerchart', '@humanspeak/svelte-motion'],
		registryDependencies: ['@evilcharts/layerchart-chart'],
		type: 'registry:block',
		files: files('b-monospace-bar-chart', 'b-monospace-bar-chart-bar')
	},
	{
		name: 'hover-trace-bar-chart',
		description: 'Bar chart with active value line and animated marker',
		dependencies: ['layerchart', '@humanspeak/svelte-motion', '@number-flow/svelte'],
		registryDependencies: ['@evilcharts/layerchart-chart'],
		type: 'registry:block',
		files: files(
			'b-hover-trace-bar-chart',
			'b-hover-trace-bar-chart-bar',
			'b-hover-trace-bar-chart-trace'
		)
	},
	{
		name: 'grid-bar-chart',
		description: 'Bar chart where each bar is composed of stacked 10x10px squares',
		dependencies: ['layerchart'],
		registryDependencies: ['@evilcharts/layerchart-chart'],
		type: 'registry:block',
		files: files('b-grid-bar-chart', 'b-grid-bar-chart-bar')
	},
	{
		name: 'isometric-bar-chart',
		description: 'Bar chart with isometric 3D-extruded bars and a highlighted max value',
		dependencies: ['layerchart', '@humanspeak/svelte-motion'],
		registryDependencies: ['@evilcharts/layerchart-chart'],
		type: 'registry:block',
		files: files('b-isometric-bar-chart', 'b-isometric-bar-chart-bar', 'b-isometric-bar-chart-defs')
	},
	{
		name: 'market-share-pie-chart',
		description: 'Interactive market-share donut with a selectable value breakdown',
		dependencies: ['layerchart', '@humanspeak/svelte-motion'],
		registryDependencies: ['@evilcharts/layerchart-pie-chart'],
		type: 'registry:block',
		files: files('b-market-share-pie-chart')
	},
	{
		name: 'progress-rings-pie-chart',
		description: 'Research summary with paired dotted progress rings',
		dependencies: ['layerchart', '@humanspeak/svelte-motion'],
		registryDependencies: ['@evilcharts/layerchart-pie-chart'],
		type: 'registry:block',
		files: files('b-progress-rings-pie-chart')
	},
	{
		name: 'revenue-mix-pie-chart',
		description: 'Revenue-channel donut with order total and compact breakdown',
		dependencies: ['layerchart', '@humanspeak/svelte-motion'],
		registryDependencies: ['@evilcharts/layerchart-pie-chart'],
		type: 'registry:block',
		files: files('b-revenue-mix-pie-chart')
	},
	{
		name: 'reliability-score-pie-chart',
		description: 'Segmented reliability gauge with score band and threshold scale',
		dependencies: ['layerchart', '@humanspeak/svelte-motion'],
		registryDependencies: ['@evilcharts/layerchart-pie-chart'],
		type: 'registry:block',
		files: files('b-reliability-score-pie-chart')
	},
	{
		name: 'capability-radar-chart',
		description: 'Team capability dashboard comparing current and target performance',
		dependencies: ['layerchart', '@humanspeak/svelte-motion'],
		registryDependencies: ['@evilcharts/layerchart-radar-chart'],
		type: 'registry:block',
		files: files('b-capability-radar-chart')
	},
	{
		name: 'budget-radial-chart',
		description: 'Quarterly budget dashboard with allocation rings and ledger rows',
		dependencies: ['layerchart', '@humanspeak/svelte-motion'],
		registryDependencies: ['@evilcharts/layerchart-radial-chart'],
		type: 'registry:block',
		files: files('b-budget-radial-chart')
	},
	{
		name: 'ride-radial-chart',
		description: 'Cycling activity dashboard with goal, radial metrics, and effort splits',
		dependencies: ['layerchart', '@humanspeak/svelte-motion', '@lucide/svelte'],
		registryDependencies: ['@evilcharts/layerchart-radial-chart'],
		type: 'registry:block',
		files: files('b-ride-radial-chart')
	},
	{
		name: 'cache-tiers-radial-chart',
		description: 'Cache operations summary with semi-radial tiers and health counters',
		dependencies: ['layerchart', '@humanspeak/svelte-motion'],
		registryDependencies: ['@evilcharts/layerchart-radial-chart'],
		type: 'registry:block',
		files: files('b-cache-tiers-radial-chart')
	},
	{
		name: 'allocation-sankey-chart',
		description: 'Fund-allocation flow with position, AUM, and hedging metrics',
		dependencies: ['layerchart', '@humanspeak/svelte-motion'],
		registryDependencies: ['@evilcharts/layerchart-sankey-chart'],
		type: 'registry:block',
		files: files('b-allocation-sankey-chart')
	},
	{
		name: 'pipeline-sankey-chart',
		description: 'Revenue pipeline flow with a central booked-value summary',
		dependencies: ['layerchart', '@humanspeak/svelte-motion'],
		registryDependencies: ['@evilcharts/layerchart-sankey-chart'],
		type: 'registry:block',
		files: files('b-pipeline-sankey-chart')
	}
];

const echartsBlockDescriptions = {
	'b-latency-echarts-area-chart':
		'Latency percentile monitor with an HTML stat row, on the ECharts area chart',
	'b-portfolio-echarts-area-chart':
		'Portfolio comparison card with hover-reveal, on the ECharts area chart',
	'b-benchmark-echarts-area-chart':
		'Growth against a dashed benchmark — hatched lead area, rounded step plateaus',
	'b-audience-echarts-area-chart':
		'Audience growth card with a multi-stop gradient line and faded wash',
	'b-market-share-echarts-pie-chart':
		'Grayscale donut with a center total and a two-column value legend',
	'b-progress-rings-echarts-pie-chart':
		'Dotted progress rings with a centered stat, built from per-dot pie sectors',
	'b-budget-echarts-radial-chart':
		'Budget breakdown card with four gauges and a value list, on the radial chart',
	'b-ride-echarts-radial-chart':
		'Activity summary card with a distance goal bar and three metric gauges',
	'b-cache-tiers-echarts-radial-chart':
		'Semi-circle multi-ring gauge with a stat grid and a share legend',
	'b-revenue-mix-echarts-pie-chart':
		'Gapped donut with a center total and a side legend of amounts',
	'b-reliability-score-echarts-pie-chart':
		'Banded score arc with a range scale, built from pie sectors',
	'b-payouts-echarts-line-chart': 'Payout trend card with a glowing gradient line and stat rows',
	'b-shipments-echarts-line-chart':
		'Week-over-week comparison with a solid and a dashed grayscale line',
	'b-grid-echarts-bar-chart':
		'Bar chart whose columns are stacks of blocks, on the ECharts blocks variant',
	'b-monospace-echarts-bar-chart':
		'Monospace sales card whose hairline bars expand on hover, on the ECharts bar chart',
	'b-peak-echarts-bar-chart': 'Stacked weekly signups with only the best week in color',
	'b-allocation-echarts-sankey-chart': 'Fund allocation flow with labelled nodes and a stat row',
	'b-pipeline-echarts-sankey-chart':
		'Revenue sources converging through a hub and fanning back out, with a centered total'
} as const;

const echartsBlockItems: RegistryItem[] = Object.entries(echartsBlockDescriptions).map(
	([fileName, description]) => {
		const family = ['area', 'line', 'bar', 'pie', 'radial', 'sankey'].find((candidate) =>
			fileName.endsWith(`-${candidate}-chart`)
		);
		if (!family) throw new Error(`Unable to resolve ECharts block family for "${fileName}".`);
		return {
			name: fileName.replace(/^b-/, ''),
			description,
			dependencies:
				fileName === 'b-ride-echarts-radial-chart' ? ['echarts', '@lucide/svelte'] : ['echarts'],
			registryDependencies: [`@evilcharts/echarts-${family}-chart`],
			type: 'registry:block',
			files: echartsFiles(fileName)
		};
	}
);

export const blocks: RegistryItem[] = withNotice([...blockItems, ...echartsBlockItems]);
