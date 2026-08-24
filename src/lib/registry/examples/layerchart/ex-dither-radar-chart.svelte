<script lang="ts">
	import {
		EvilRadarChart,
		type ChartConfig
	} from '$lib/registry/charts/layerchart-radar-chart/index.js';
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

<EvilRadarChart {data} {config} renderStyle="dither" bloom="low" class="h-full w-full p-4">
	<EvilRadarChart.PolarGrid /><EvilRadarChart.PolarAngleAxis
		dataKey="skill"
	/><EvilRadarChart.Legend isClickable /><EvilRadarChart.Tooltip />
	<EvilRadarChart.Radar dataKey="desktop" ditherVariant="gradient" isClickable />
	<EvilRadarChart.Radar dataKey="mobile" ditherVariant="hatched" isClickable />
</EvilRadarChart>
