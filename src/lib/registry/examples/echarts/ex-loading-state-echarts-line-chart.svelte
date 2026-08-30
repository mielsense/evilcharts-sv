<script lang="ts">
	import { EChartsLineChart } from '$lib/registry/charts/echarts-line-chart/index.js';
	import { type ChartConfig } from '$lib/registry/ui/echarts-chart/index.js';

	const data: { month: string; desktop: number; mobile: number }[] = [];

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

<!-- [!code highlight:7] -->
<EChartsLineChart
	{data}
	config={chartConfig}
	class="h-full w-full p-4"
	isLoading={true}
	curveType="bump"
>
	<EChartsLineChart.XAxis
		dataKey="month"
		tickFormatter={(value) => String(value).substring(0, 3)}
	/>
	<EChartsLineChart.YAxis dataKey="desktop" />
	<EChartsLineChart.Legend isClickable />
	<EChartsLineChart.Tooltip />
	<EChartsLineChart.Line dataKey="desktop" strokeVariant="solid" isClickable>
		<EChartsLineChart.ActiveDot variant="default" />
	</EChartsLineChart.Line>
	<EChartsLineChart.Line dataKey="mobile" strokeVariant="solid" isClickable>
		<EChartsLineChart.ActiveDot variant="default" />
	</EChartsLineChart.Line>
</EChartsLineChart>
