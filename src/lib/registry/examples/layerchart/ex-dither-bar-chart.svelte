<script lang="ts">
	import {
		EvilBarChart,
		type ChartConfig
	} from '$lib/registry/charts/layerchart-bar-chart/index.js';
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
		mobile: { label: 'Mobile', colors: { light: ['#be123c'], dark: ['#f43f5e'] } }
	} satisfies ChartConfig;
</script>

<EvilBarChart
	{data}
	{config}
	xDataKey="month"
	renderStyle="dither"
	bloom="low"
	class="h-full w-full p-4"
>
	<EvilBarChart.Grid /><EvilBarChart.XAxis dataKey="month" /><EvilBarChart.Legend
		isClickable
	/><EvilBarChart.Tooltip />
	<EvilBarChart.Bar dataKey="desktop" ditherVariant="gradient" isClickable enableHoverHighlight />
	<EvilBarChart.Bar dataKey="mobile" ditherVariant="hatched" isClickable enableHoverHighlight />
</EvilBarChart>
