<script lang="ts">
	import { EChartsRadarChart } from '$lib/registry/charts/echarts-radar-chart/index.js';
	import { type ChartConfig } from '$lib/registry/ui/echarts-chart/index.js';

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

<!-- [!code highlight] -->
<EChartsRadarChart data={[]} config={chartConfig} class="h-full w-full p-4" isLoading={true}>
	<EChartsRadarChart.PolarGrid />
	<EChartsRadarChart.PolarAngleAxis dataKey="skill" />
	<EChartsRadarChart.Legend />
	<EChartsRadarChart.Tooltip />
	<EChartsRadarChart.Radar dataKey="desktop" variant="filled" />
	<EChartsRadarChart.Radar dataKey="mobile" variant="filled" />
</EChartsRadarChart>
