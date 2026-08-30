<script lang="ts">
	import { EChartsBarChart } from '$lib/registry/charts/echarts-bar-chart/index.js';
	import { type ChartConfig } from '$lib/registry/ui/echarts-chart/index.js';

	const data = [
		{ month: 'January', desktop: 186 },
		{ month: 'February', desktop: 305 },
		{ month: 'March', desktop: 237 },
		{ month: 'April', desktop: 173 },
		{ month: 'May', desktop: 209 },
		{ month: 'June', desktop: 214 }
	];

	const chartConfig = {
		desktop: {
			label: 'Desktop',
			colors: {
				light: ['#2563eb'],
				dark: ['#3b82f6']
			}
		}
	} satisfies ChartConfig;
</script>

<!-- [!code highlight:6] -->
<EChartsBarChart {data} config={chartConfig} class="h-full w-full p-4" layout="horizontal">
	<EChartsBarChart.Grid />
	<!-- [!code highlight] -->
	<EChartsBarChart.YAxis dataKey="month" tickFormatter={(value) => String(value).substring(0, 3)} />
	<EChartsBarChart.Legend />
	<EChartsBarChart.Tooltip />
	<EChartsBarChart.Bar dataKey="desktop" variant="default" />
</EChartsBarChart>
