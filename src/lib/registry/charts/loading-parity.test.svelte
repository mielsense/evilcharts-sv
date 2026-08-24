<script lang="ts">
	import { EvilAreaChart } from './layerchart-area-chart/index.js';
	import { EvilBarChart } from './layerchart-bar-chart/index.js';
	import { EvilComposedChart } from './layerchart-composed-chart/index.js';
	import { EvilLineChart } from './layerchart-line-chart/index.js';
	import { EvilPieChart } from './layerchart-pie-chart/index.js';
	import type { ChartConfig } from '../ui/layerchart-chart/index.js';

	type Family = 'area' | 'line' | 'bar' | 'composed' | 'pie';
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
	{:else}
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
	{/if}
</div>
