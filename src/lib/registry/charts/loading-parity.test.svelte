<script lang="ts">
	import { EvilAreaChart } from './layerchart-area-chart/index.js';
	import { EvilBarChart } from './layerchart-bar-chart/index.js';
	import { EvilComposedChart } from './layerchart-composed-chart/index.js';
	import { EvilLineChart } from './layerchart-line-chart/index.js';
	import { EvilPieChart } from './layerchart-pie-chart/index.js';
	import { EvilRadarChart } from './layerchart-radar-chart/index.js';
	import { EvilRadialChart } from './layerchart-radial-chart/index.js';
	import { EvilSankeyChart, type SankeyData } from './layerchart-sankey-chart/index.js';
	import type { ChartConfig } from '../ui/layerchart-chart/index.js';

	type Family = 'area' | 'line' | 'bar' | 'composed' | 'pie' | 'radar' | 'radial' | 'sankey';
	let { family }: { family: Family } = $props();

	const cartesianData = [
		{ month: 'January', desktop: 342, mobile: 245 },
		{ month: 'February', desktop: 876, mobile: 654 }
	];
	const cartesianConfig = {
		desktop: { label: 'Desktop', colors: { light: ['#047857'] } },
		mobile: { label: 'Mobile', colors: { light: ['#be123c'] } }
	} satisfies ChartConfig;

	const pieData = [
		{ browser: 'chrome', visitors: 275 },
		{ browser: 'safari', visitors: 200 }
	];
	const pieConfig = {
		chrome: { label: 'Chrome', colors: { light: ['#3b82f6'] } },
		safari: { label: 'Safari', colors: { light: ['#10b981'] } }
	} satisfies ChartConfig;
	const radarData = [
		{ skill: 'Design', desktop: 80, mobile: 55 },
		{ skill: 'Code', desktop: 65, mobile: 75 },
		{ skill: 'Research', desktop: 70, mobile: 60 }
	];
	const sankeyData = {
		nodes: [{ name: 'Alpha' }, { name: 'Beta' }],
		links: [{ source: 0, target: 1, value: 10 }]
	} satisfies SankeyData;
	const sankeyConfig = {
		Alpha: { label: 'Alpha', colors: { light: ['#3b82f6'] } },
		Beta: { label: 'Beta', colors: { light: ['#10b981'] } }
	} satisfies ChartConfig;

	let loading = $state(true);
</script>

<button type="button" data-load onclick={() => (loading = false)}>load chart</button>

<div data-test={family} style="height: 200px; width: 320px;">
	{#if family === 'area'}
		<EvilAreaChart
			data={cartesianData}
			config={cartesianConfig}
			xDataKey="month"
			isLoading={loading}
			class="h-full"
		>
			<EvilAreaChart.XAxis dataKey="month" />
			<EvilAreaChart.Legend isClickable />
			<EvilAreaChart.Tooltip />
			<EvilAreaChart.Area dataKey="desktop" />
			<EvilAreaChart.Area dataKey="mobile" />
		</EvilAreaChart>
	{:else if family === 'line'}
		<EvilLineChart
			data={cartesianData}
			config={cartesianConfig}
			xDataKey="month"
			isLoading={loading}
			class="h-full"
		>
			<EvilLineChart.XAxis dataKey="month" />
			<EvilLineChart.Legend isClickable />
			<EvilLineChart.Tooltip />
			<EvilLineChart.Line dataKey="desktop" />
			<EvilLineChart.Line dataKey="mobile" />
		</EvilLineChart>
	{:else if family === 'bar'}
		<EvilBarChart
			data={cartesianData}
			config={cartesianConfig}
			xDataKey="month"
			isLoading={loading}
			class="h-full"
		>
			<EvilBarChart.XAxis dataKey="month" />
			<EvilBarChart.Legend isClickable />
			<EvilBarChart.Tooltip />
			<EvilBarChart.Bar dataKey="desktop" />
			<EvilBarChart.Bar dataKey="mobile" />
		</EvilBarChart>
	{:else if family === 'composed'}
		<EvilComposedChart
			data={cartesianData}
			config={cartesianConfig}
			xDataKey="month"
			isLoading={loading}
			class="h-full"
		>
			<EvilComposedChart.XAxis dataKey="month" />
			<EvilComposedChart.Legend isClickable />
			<EvilComposedChart.Tooltip />
			<EvilComposedChart.Bar dataKey="desktop" />
			<EvilComposedChart.Line dataKey="mobile" />
		</EvilComposedChart>
	{:else if family === 'pie'}
		<EvilPieChart
			data={pieData}
			dataKey="visitors"
			nameKey="browser"
			config={pieConfig}
			isLoading={loading}
			class="h-full"
		>
			<EvilPieChart.Legend isClickable />
			<EvilPieChart.Tooltip />
			<EvilPieChart.Pie isClickable />
		</EvilPieChart>
	{:else if family === 'radar'}
		<EvilRadarChart data={radarData} config={cartesianConfig} isLoading={loading} class="h-full">
			<EvilRadarChart.PolarAngleAxis dataKey="skill" />
			<EvilRadarChart.Legend isClickable />
			<EvilRadarChart.Radar dataKey="desktop" isClickable />
			<EvilRadarChart.Radar dataKey="mobile" isClickable />
		</EvilRadarChart>
	{:else if family === 'radial'}
		<EvilRadialChart
			data={pieData}
			nameKey="browser"
			config={pieConfig}
			isLoading={loading}
			class="h-full"
		>
			<EvilRadialChart.Legend isClickable />
			<EvilRadialChart.RadialBar dataKey="visitors" isClickable />
		</EvilRadialChart>
	{:else}
		<EvilSankeyChart data={sankeyData} config={sankeyConfig} isLoading={loading} class="h-full">
			<EvilSankeyChart.Node isClickable />
			<EvilSankeyChart.Link />
		</EvilSankeyChart>
	{/if}
</div>
