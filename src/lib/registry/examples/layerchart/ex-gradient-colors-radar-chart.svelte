<script lang="ts">
	import { EvilRadarChart } from '$lib/registry/charts/layerchart-radar-chart/index.js';
	import { type ChartConfig } from '$lib/registry/ui/layerchart-chart/index.js';

	const data = [
		{ skill: 'JavaScript', desktop: 186, mobile: 80 },
		{ skill: 'TypeScript', desktop: 305, mobile: 200 },
		{ skill: 'React', desktop: 237, mobile: 120 },
		{ skill: 'Node.js', desktop: 173, mobile: 190 },
		{ skill: 'CSS', desktop: 209, mobile: 130 },
		{ skill: 'Python', desktop: 214, mobile: 140 }
	];

	const chartConfig = {
		desktop: {
			label: 'Desktop',
			colors: {
				// [!code highlight:2]
				light: ['#6366f1', '#a855f7', '#ec4899'], // Indigo -> Purple -> Pink
				dark: ['red', 'orange', 'pink']
			}
		},
		mobile: {
			label: 'Mobile',
			colors: {
				// [!code highlight:2]
				light: ['#14b8a6', '#06b6d4', '#3b82f6'], // Teal -> Cyan -> Blue
				dark: ['#2dd4bf', '#22d3ee', '#60a5fa']
			}
		}
	} satisfies ChartConfig;
</script>

<EvilRadarChart {data} config={chartConfig} class="h-full w-full p-4">
	<EvilRadarChart.PolarGrid />
	<EvilRadarChart.PolarAngleAxis dataKey="skill" />
	<EvilRadarChart.Legend />
	<EvilRadarChart.Tooltip />
	<EvilRadarChart.Radar dataKey="desktop" variant="filled">
		<EvilRadarChart.Dot variant="colored-border" />
		<EvilRadarChart.ActiveDot variant="default" />
	</EvilRadarChart.Radar>
	<EvilRadarChart.Radar dataKey="mobile" variant="filled">
		<EvilRadarChart.Dot variant="colored-border" />
		<EvilRadarChart.ActiveDot variant="default" />
	</EvilRadarChart.Radar>
</EvilRadarChart>
