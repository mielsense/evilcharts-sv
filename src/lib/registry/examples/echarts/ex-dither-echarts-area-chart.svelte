<script lang="ts">
	import {
		EChartsAreaChart,
		type ChartConfig
	} from '$lib/registry/charts/echarts-area-chart/index.js';

	const data = [
		{ month: 'Jan', desktop: 42, mobile: 25 },
		{ month: 'Feb', desktop: 76, mobile: 54 },
		{ month: 'Mar', desktop: 51, mobile: 38 },
		{ month: 'Apr', desktop: 84, mobile: 62 },
		{ month: 'May', desktop: 63, mobile: 47 },
		{ month: 'Jun', desktop: 91, mobile: 70 }
	];
	const config = {
		desktop: {
			label: 'Desktop',
			colors: { light: ['#047857', '#34d399'], dark: ['#10b981', '#6ee7b7'] }
		},
		mobile: {
			label: 'Mobile',
			colors: { light: ['#be123c', '#fb7185'], dark: ['#f43f5e', '#fda4af'] }
		}
	} satisfies ChartConfig;
</script>

<EChartsAreaChart
	{data}
	{config}
	xDataKey="month"
	renderStyle="dither"
	bloom="low"
	class="h-full w-full p-4"
>
	<EChartsAreaChart.Grid />
	<EChartsAreaChart.XAxis dataKey="month" />
	<EChartsAreaChart.Legend isClickable />
	<EChartsAreaChart.Tooltip />
	<EChartsAreaChart.Area dataKey="desktop" ditherVariant="gradient" isClickable />
	<EChartsAreaChart.Area dataKey="mobile" ditherVariant="hatched" isClickable />
</EChartsAreaChart>
