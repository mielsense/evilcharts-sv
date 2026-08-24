<script lang="ts">
	import {
		EvilAreaChart,
		type ChartConfig
	} from '$lib/registry/charts/layerchart-area-chart/index.js';

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

<EvilAreaChart
	{data}
	{config}
	xDataKey="month"
	renderStyle="dither"
	bloom="low"
	class="h-full w-full p-4"
>
	<EvilAreaChart.Grid /><EvilAreaChart.XAxis dataKey="month" /><EvilAreaChart.Legend
		isClickable
	/><EvilAreaChart.Tooltip />
	<EvilAreaChart.Area dataKey="desktop" ditherVariant="gradient" isClickable />
	<EvilAreaChart.Area dataKey="mobile" ditherVariant="hatched" isClickable />
</EvilAreaChart>
