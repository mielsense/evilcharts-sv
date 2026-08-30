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
				light: ['#3b82f6'],
				dark: ['#60a5fa']
			}
		},
		mobile: {
			label: 'Mobile',
			colors: {
				light: ['#10b981'],
				dark: ['#34d399']
			}
		}
	} satisfies ChartConfig;
</script>

<EChartsRadarChart
	{data}
	config={chartConfig}
	accessibility={{
		label: 'Desktop and mobile skill comparison radar chart',
		description: 'Desktop and mobile scores across six programming skills.'
	}}
	class="h-full w-full p-4"
>
	<EChartsRadarChart.PolarGrid />
	<EChartsRadarChart.PolarAngleAxis dataKey="skill" />
	<EChartsRadarChart.Legend isClickable />
	<EChartsRadarChart.Tooltip />
	<!-- [!code highlight:2] -->
	<EChartsRadarChart.Radar dataKey="desktop" variant="filled" isClickable>
		<EChartsRadarChart.Dot variant="colored-border" />
		<EChartsRadarChart.ActiveDot variant="default" />
	</EChartsRadarChart.Radar>
	<EChartsRadarChart.Radar dataKey="mobile" variant="filled" isClickable>
		<EChartsRadarChart.Dot variant="colored-border" />
		<EChartsRadarChart.ActiveDot variant="default" />
	</EChartsRadarChart.Radar>
</EChartsRadarChart>
