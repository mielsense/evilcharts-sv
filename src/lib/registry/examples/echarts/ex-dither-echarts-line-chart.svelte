<script lang="ts">
	import {
		EChartsLineChart,
		type ChartConfig
	} from '$lib/registry/charts/echarts-line-chart/index.js';
	const data = [
		{ month: 'Jan', desktop: 42, mobile: 25 },
		{ month: 'Feb', desktop: 76, mobile: 54 },
		{ month: 'Mar', desktop: 51, mobile: 38 },
		{ month: 'Apr', desktop: 84, mobile: 62 },
		{ month: 'May', desktop: 63, mobile: 47 },
		{ month: 'Jun', desktop: 91, mobile: 70 }
	];
	const config = {
		desktop: { label: 'Desktop', colors: { light: ['#047857'], dark: ['#10b981'] } },
		mobile: { label: 'Mobile', colors: { light: ['#be123c'], dark: ['#f43f5e'] } }
	} satisfies ChartConfig;
</script>

<EChartsLineChart
	{data}
	{config}
	xDataKey="month"
	renderStyle="dither"
	ditherVariant="dotted"
	ditherCellSize={3}
	bloom="aura"
	class="h-full w-full p-4"
>
	<EChartsLineChart.Grid /><EChartsLineChart.XAxis dataKey="month" /><EChartsLineChart.Legend
		isClickable
	/><EChartsLineChart.Tooltip />
	<EChartsLineChart.Line dataKey="desktop" isClickable /><EChartsLineChart.Line
		dataKey="mobile"
		strokeVariant="dashed"
		isClickable
	/>
</EChartsLineChart>
