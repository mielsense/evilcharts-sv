<script lang="ts">
	import type { ChartConfig } from '../ui/echarts-chart/index.js';
	import { EChartsAreaChart } from './echarts-area-chart/index.js';
	import { EChartsBarChart } from './echarts-bar-chart/index.js';
	import { EChartsComposedChart } from './echarts-composed-chart/index.js';
	import { EChartsLineChart } from './echarts-line-chart/index.js';
	import { EChartsPieChart } from './echarts-pie-chart/index.js';
	import { EChartsRadarChart } from './echarts-radar-chart/index.js';

	type Family = 'area' | 'line' | 'bar' | 'composed' | 'pie' | 'radar';
	// Loading keeps ECharts from rejecting intentionally duplicated runtime series ids before the
	// accessibility-control registrations can be asserted.
	let { family, duplicate = false }: { family: Family; duplicate?: boolean } = $props();
	let selected = $state('none');

	const cartesianData = [
		{ month: 'January', desktop: 342, mobile: 245 },
		{ month: 'February', desktop: 876, mobile: 654 }
	];
	const config = {
		desktop: { label: 'Desktop', colors: { light: ['#047857'] } },
		mobile: { label: 'Mobile', colors: { light: ['#be123c'] } },
		chrome: { label: 'Chrome', colors: { light: ['#3b82f6'] } },
		safari: { label: 'Safari', colors: { light: ['#10b981'] } }
	} satisfies ChartConfig;
	const pieData = [
		{ browser: 'chrome', visitors: 275 },
		{ browser: 'safari', visitors: 200 }
	];
	const radarData = [
		{ skill: 'Design', desktop: 80, mobile: 55 },
		{ skill: 'Code', desktop: 65, mobile: 75 },
		{ skill: 'Research', desktop: 70, mobile: 60 }
	];
</script>

<div style="height: 200px; width: 320px;">
	{#if family === 'area'}
		<EChartsAreaChart
			data={cartesianData}
			{config}
			xDataKey="month"
			renderer="svg"
			animation={false}
			isLoading={duplicate}
			class="h-full"
			onSelectionChange={(key) => (selected = key ?? 'none')}
		>
			<EChartsAreaChart.Area dataKey="desktop" isClickable />
			{#if duplicate}<EChartsAreaChart.Area dataKey="desktop" isClickable />{/if}
			<EChartsAreaChart.Area dataKey="mobile" isClickable />
		</EChartsAreaChart>
	{:else if family === 'line'}
		<EChartsLineChart
			data={cartesianData}
			{config}
			xDataKey="month"
			renderer="svg"
			animation={false}
			isLoading={duplicate}
			class="h-full"
			onSelectionChange={(key) => (selected = key ?? 'none')}
		>
			<EChartsLineChart.Line dataKey="desktop" isClickable />
			{#if duplicate}<EChartsLineChart.Line dataKey="desktop" isClickable />{/if}
			<EChartsLineChart.Line dataKey="mobile" isClickable />
		</EChartsLineChart>
	{:else if family === 'bar'}
		<EChartsBarChart
			data={cartesianData}
			{config}
			xDataKey="month"
			renderer="svg"
			animation={false}
			isLoading={duplicate}
			class="h-full"
			onSelectionChange={(key) => (selected = key ?? 'none')}
		>
			<EChartsBarChart.Bar dataKey="desktop" isClickable />
			{#if duplicate}<EChartsBarChart.Bar dataKey="desktop" isClickable />{/if}
			<EChartsBarChart.Bar dataKey="mobile" isClickable />
		</EChartsBarChart>
	{:else if family === 'composed'}
		<EChartsComposedChart
			data={cartesianData}
			{config}
			xDataKey="month"
			renderer="svg"
			animation={false}
			class="h-full"
			onSelectionChange={(key) => (selected = key ?? 'none')}
		>
			<EChartsComposedChart.Bar dataKey="desktop" isClickable />
			<EChartsComposedChart.Line dataKey="mobile" isClickable />
		</EChartsComposedChart>
	{:else if family === 'pie'}
		<EChartsPieChart
			data={pieData}
			dataKey="visitors"
			nameKey="browser"
			{config}
			renderer="svg"
			animation={false}
			class="h-full"
			onSelectionChange={(item) => (selected = item?.dataKey ?? 'none')}
		>
			<EChartsPieChart.Pie isClickable />
		</EChartsPieChart>
	{:else}
		<EChartsRadarChart
			data={radarData}
			{config}
			renderer="svg"
			animation={false}
			isLoading={duplicate}
			class="h-full"
			onSelectionChange={(key) => (selected = key ?? 'none')}
		>
			<EChartsRadarChart.PolarAngleAxis dataKey="skill" />
			<EChartsRadarChart.Radar dataKey="desktop" isClickable />
			{#if duplicate}<EChartsRadarChart.Radar dataKey="desktop" isClickable />{/if}
			<EChartsRadarChart.Radar dataKey="mobile" isClickable />
		</EChartsRadarChart>
	{/if}
</div>
<output data-test="selection">{selected}</output>

<style>
	:global([data-slot='echarts-host']) {
		width: 320px;
		height: 200px;
	}
</style>
