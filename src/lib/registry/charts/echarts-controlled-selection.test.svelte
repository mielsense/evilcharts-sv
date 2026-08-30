<script lang="ts">
	import type { ChartConfig } from '../ui/echarts-chart/index.js';
	import { EChartsAreaChart } from './echarts-area-chart/index.js';
	import { EChartsPieChart } from './echarts-pie-chart/index.js';

	let { family }: { family: 'area' | 'pie' } = $props();

	const cartesianData = [
		{ month: 'January', desktop: 12, mobile: 18 },
		{ month: 'February', desktop: 20, mobile: 14 }
	];
	const pieData = [
		{ browser: 'chrome', visitors: 275 },
		{ browser: 'safari', visitors: 200 }
	];
	const config = {
		desktop: { label: 'Desktop', colors: { light: ['#2563eb'] } },
		mobile: { label: 'Mobile', colors: { light: ['#db2777'] } },
		chrome: { label: 'Chrome', colors: { light: ['#3b82f6'] } },
		safari: { label: 'Safari', colors: { light: ['#10b981'] } }
	} satisfies ChartConfig;

	let areaSelection = $state<string | null>('mobile');
	let pieSelection = $state<string | null>('safari');
	let callbackValue = $state('none');
</script>

<button
	type="button"
	data-select="target"
	onclick={() => {
		if (family === 'area') areaSelection = 'desktop';
		else pieSelection = 'chrome';
	}}>select target</button
>
<button
	type="button"
	data-select="none"
	onclick={() => {
		if (family === 'area') areaSelection = null;
		else pieSelection = null;
	}}>clear selection</button
>
<output data-callback>{callbackValue}</output>

<div style="height: 200px; width: 320px;">
	{#if family === 'area'}
		<EChartsAreaChart
			data={cartesianData}
			{config}
			xDataKey="month"
			renderer="svg"
			animation={false}
			selectedDataKey={areaSelection}
			defaultSelectedDataKey="mobile"
			class="h-full"
			onSelectionChange={(key) => (callbackValue = key ?? 'none')}
		>
			<EChartsAreaChart.Area dataKey="desktop" isClickable />
			<EChartsAreaChart.Area dataKey="mobile" isClickable />
		</EChartsAreaChart>
	{:else}
		<EChartsPieChart
			data={pieData}
			dataKey="visitors"
			nameKey="browser"
			{config}
			renderer="svg"
			animation={false}
			selectedSector={pieSelection}
			defaultSelectedSector="safari"
			class="h-full"
			onSelectionChange={(item) => (callbackValue = item?.dataKey ?? 'none')}
		>
			<EChartsPieChart.Pie isClickable />
		</EChartsPieChart>
	{/if}
</div>

<style>
	:global([data-slot='echarts-host']) {
		width: 320px;
		height: 200px;
	}
</style>
