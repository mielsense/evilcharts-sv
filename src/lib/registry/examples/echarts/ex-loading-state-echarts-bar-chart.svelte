<script lang="ts">
	import { EChartsBarChart } from '$lib/registry/charts/echarts-bar-chart/index.js';
	import { type ChartConfig } from '$lib/registry/ui/echarts-chart/index.js';

	const chartConfig = {
		desktop: {
			label: 'Desktop',
			colors: {
				light: ['#047857'],
				dark: ['#10b981']
			}
		},
		mobile: {
			label: 'Mobile',
			colors: {
				light: ['#be123c'],
				dark: ['#f43f5e']
			}
		}
	} satisfies ChartConfig;
</script>

<!-- [!code highlight:6] -->
<EChartsBarChart data={[]} config={chartConfig} class="h-full w-full p-4" isLoading={true}>
	<EChartsBarChart.Grid />
	<EChartsBarChart.XAxis dataKey="month" tickFormatter={(value) => String(value).substring(0, 3)} />
	<EChartsBarChart.Legend />
	<EChartsBarChart.Tooltip />
	<EChartsBarChart.Bar dataKey="desktop" variant="default" />
	<EChartsBarChart.Bar dataKey="mobile" variant="default" />
</EChartsBarChart>
