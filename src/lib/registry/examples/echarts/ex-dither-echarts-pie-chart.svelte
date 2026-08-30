<script lang="ts">
	import {
		EChartsPieChart,
		type ChartConfig
	} from '$lib/registry/charts/echarts-pie-chart/index.js';
	const data = [
		{ browser: 'chrome', visitors: 46 },
		{ browser: 'safari', visitors: 28 },
		{ browser: 'firefox', visitors: 17 },
		{ browser: 'other', visitors: 9 }
	];
	const config = {
		chrome: { label: 'Chrome', colors: { light: ['#047857'], dark: ['#10b981'] } },
		safari: { label: 'Safari', colors: { light: ['#0369a1'], dark: ['#38bdf8'] } },
		firefox: { label: 'Firefox', colors: { light: ['#be123c'], dark: ['#f43f5e'] } },
		other: { label: 'Other', colors: { light: ['#a16207'], dark: ['#facc15'] } }
	} satisfies ChartConfig;
</script>

<EChartsPieChart
	{data}
	{config}
	dataKey="visitors"
	nameKey="browser"
	renderStyle="dither"
	bloom="low"
	class="h-full w-full p-4"
>
	<EChartsPieChart.Legend isClickable /><EChartsPieChart.Tooltip />
	<EChartsPieChart.Pie innerRadius={54} ditherVariant="gradient" isClickable />
</EChartsPieChart>
