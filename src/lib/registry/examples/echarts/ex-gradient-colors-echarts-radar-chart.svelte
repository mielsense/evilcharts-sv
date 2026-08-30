<script lang="ts">
	import { EChartsRadarChart } from '$lib/registry/charts/echarts-radar-chart/index.js';
	import { type ChartConfig } from '$lib/registry/ui/echarts-chart/index.js';

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

<EChartsRadarChart {data} config={chartConfig} class="h-full w-full p-4">
	<EChartsRadarChart.PolarGrid />
	<EChartsRadarChart.PolarAngleAxis dataKey="skill" />
	<EChartsRadarChart.Legend />
	<EChartsRadarChart.Tooltip />
	<EChartsRadarChart.Radar dataKey="desktop" variant="filled">
		<EChartsRadarChart.Dot variant="colored-border" />
		<EChartsRadarChart.ActiveDot variant="default" />
	</EChartsRadarChart.Radar>
	<EChartsRadarChart.Radar dataKey="mobile" variant="filled">
		<EChartsRadarChart.Dot variant="colored-border" />
		<EChartsRadarChart.ActiveDot variant="default" />
	</EChartsRadarChart.Radar>
</EChartsRadarChart>
