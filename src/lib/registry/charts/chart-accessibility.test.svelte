<script lang="ts">
	import type { ChartAccessibility, ChartConfig } from '../ui/layerchart-chart/index.js';
	import { EvilAreaChart } from './layerchart-area-chart/index.js';
	import { EvilBarChart } from './layerchart-bar-chart/index.js';
	import { EvilComposedChart } from './layerchart-composed-chart/index.js';
	import { EvilLineChart } from './layerchart-line-chart/index.js';
	import { EvilPieChart } from './layerchart-pie-chart/index.js';
	import { EvilRadarChart } from './layerchart-radar-chart/index.js';
	import { EvilRadialChart } from './layerchart-radial-chart/index.js';
	import { EvilSankeyChart, type SankeyData } from './layerchart-sankey-chart/index.js';

	type Family = 'area' | 'line' | 'bar' | 'composed' | 'pie' | 'radar' | 'radial' | 'sankey';
	let {
		family,
		external = false,
		seriesOnly = false
	}: { family: Family; external?: boolean; seriesOnly?: boolean } = $props();
	let selectedDataKey = $state<string | null>(null);

	const cartesianData = [
		{ month: 'January', desktop: 342, mobile: 245 },
		{ month: 'February', desktop: 876, mobile: 654 }
	];
	const cartesianConfig = {
		desktop: { label: 'Desktop', colors: { light: ['#047857'] } },
		mobile: { label: 'Mobile', colors: { light: ['#be123c'] } }
	} satisfies ChartConfig;

	const polarData = [
		{ skill: 'Design', desktop: 80, mobile: 55 },
		{ skill: 'Code', desktop: 65, mobile: 75 },
		{ skill: 'Research', desktop: 70, mobile: 60 }
	];

	const radialData = [
		{ browser: 'chrome', visitors: 275 },
		{ browser: 'safari', visitors: 200 }
	];
	const radialConfig = {
		chrome: { label: 'Chrome', colors: { light: ['#3b82f6'] } },
		safari: { label: 'Safari', colors: { light: ['#10b981'] } }
	} satisfies ChartConfig;

	const sankeyData = {
		nodes: [{ name: 'Alpha' }, { name: 'Beta' }],
		links: [{ source: 0, target: 1, value: 10 }]
	} satisfies SankeyData;
	const sankeyConfig = {
		Alpha: { label: 'Alpha', colors: { light: ['#3b82f6'] } },
		Beta: { label: 'Beta', colors: { light: ['#10b981'] } }
	} satisfies ChartConfig;

	const accessibility = $derived<ChartAccessibility>(
		external
			? { labelledBy: 'external-chart-title', describedBy: 'external-chart-description' }
			: { label: `${family} chart`, description: `${family} chart description` }
	);
</script>

{#if external}
	<h2 id="external-chart-title">Externally named area chart</h2>
	<p id="external-chart-description">Externally described area chart</p>
{/if}

<div data-test={family} style="height: 200px; width: 320px;">
	{#if family === 'area'}
		<EvilAreaChart
			data={cartesianData}
			config={cartesianConfig}
			xDataKey="month"
			animationType="none"
			{accessibility}
			onSelectionChange={(key) => (selectedDataKey = key)}
			class="h-full"
		>
			<EvilAreaChart.XAxis dataKey="month" />
			{#if !seriesOnly}<EvilAreaChart.Legend isClickable />{/if}
			<EvilAreaChart.Area dataKey="desktop" isClickable={seriesOnly} />
			<EvilAreaChart.Area dataKey="mobile" isClickable={seriesOnly} />
		</EvilAreaChart>
	{:else if family === 'line'}
		<EvilLineChart
			data={cartesianData}
			config={cartesianConfig}
			xDataKey="month"
			animationType="none"
			{accessibility}
			onSelectionChange={(key) => (selectedDataKey = key)}
			class="h-full"
		>
			<EvilLineChart.XAxis dataKey="month" />
			{#if !seriesOnly}<EvilLineChart.Legend isClickable />{/if}
			<EvilLineChart.Line dataKey="desktop" isClickable={seriesOnly} />
			<EvilLineChart.Line dataKey="mobile" isClickable={seriesOnly} />
		</EvilLineChart>
	{:else if family === 'bar'}
		<EvilBarChart
			data={cartesianData}
			config={cartesianConfig}
			xDataKey="month"
			animationType="none"
			{accessibility}
			onSelectionChange={(key) => (selectedDataKey = key)}
			class="h-full"
		>
			<EvilBarChart.XAxis dataKey="month" />
			{#if !seriesOnly}<EvilBarChart.Legend isClickable />{/if}
			<EvilBarChart.Bar dataKey="desktop" isClickable={seriesOnly} />
			<EvilBarChart.Bar dataKey="mobile" isClickable={seriesOnly} />
		</EvilBarChart>
	{:else if family === 'composed'}
		<EvilComposedChart
			data={cartesianData}
			config={cartesianConfig}
			xDataKey="month"
			animationType="none"
			{accessibility}
			class="h-full"
		>
			<EvilComposedChart.XAxis dataKey="month" />
			<EvilComposedChart.Legend isClickable />
			<EvilComposedChart.Bar dataKey="desktop" />
			<EvilComposedChart.Line dataKey="mobile" />
		</EvilComposedChart>
	{:else if family === 'pie'}
		<EvilPieChart
			data={radialData}
			dataKey="visitors"
			nameKey="browser"
			config={radialConfig}
			{accessibility}
			class="h-full"
		>
			<EvilPieChart.Legend isClickable />
			<EvilPieChart.Pie isClickable />
		</EvilPieChart>
	{:else if family === 'radar'}
		<EvilRadarChart
			data={polarData}
			config={cartesianConfig}
			{accessibility}
			onSelectionChange={(key) => (selectedDataKey = key)}
			class="h-full"
		>
			<EvilRadarChart.PolarAngleAxis dataKey="skill" />
			{#if !seriesOnly}<EvilRadarChart.Legend isClickable />{/if}
			<EvilRadarChart.Radar dataKey="desktop" isClickable />
			<EvilRadarChart.Radar dataKey="mobile" isClickable />
		</EvilRadarChart>
	{:else if family === 'radial'}
		<EvilRadialChart
			data={radialData}
			nameKey="browser"
			config={radialConfig}
			{accessibility}
			class="h-full"
		>
			<EvilRadialChart.Legend isClickable />
			<EvilRadialChart.RadialBar dataKey="visitors" isClickable />
		</EvilRadialChart>
	{:else}
		<EvilSankeyChart data={sankeyData} config={sankeyConfig} {accessibility} class="h-full">
			<EvilSankeyChart.Node isClickable />
			<EvilSankeyChart.Link />
		</EvilSankeyChart>
	{/if}
</div>
<output data-test="selection">{selectedDataKey ?? 'none'}</output>
