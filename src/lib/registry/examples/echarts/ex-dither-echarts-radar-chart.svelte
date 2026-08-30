<script lang="ts">
	import {
		EChartsRadarChart,
		type ChartConfig
	} from '$lib/registry/charts/echarts-radar-chart/index.js';
	const data = [
		{ skill: 'JS', desktop: 80, mobile: 48 },
		{ skill: 'TS', desktop: 96, mobile: 70 },
		{ skill: 'Svelte', desktop: 88, mobile: 76 },
		{ skill: 'CSS', desktop: 72, mobile: 84 },
		{ skill: 'Node', desktop: 82, mobile: 58 },
		{ skill: 'A11y', desktop: 68, mobile: 74 }
	];
	const config = {
		desktop: { label: 'Desktop', colors: { light: ['#047857'], dark: ['#10b981'] } },
		mobile: { label: 'Mobile', colors: { light: ['#be123c'], dark: ['#f43f5e'] } }
	} satisfies ChartConfig;
</script>

<EChartsRadarChart
	{data}
	{config}
	renderStyle="dither"
	ditherVariant="gradient"
	ditherCellSize={2}
	bloom="low"
	class="h-full w-full p-4"
>
	<EChartsRadarChart.PolarGrid /><EChartsRadarChart.PolarAngleAxis
		dataKey="skill"
	/><EChartsRadarChart.Legend isClickable /><EChartsRadarChart.Tooltip />
	<EChartsRadarChart.Radar dataKey="desktop" isClickable />
	<EChartsRadarChart.Radar dataKey="mobile" isClickable />
</EChartsRadarChart>
