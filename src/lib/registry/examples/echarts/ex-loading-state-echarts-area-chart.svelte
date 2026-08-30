<script lang="ts">
	import { EChartsAreaChart } from '$lib/registry/charts/echarts-area-chart/index.js';
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

<!-- [!code highlight:8] -->
<EChartsAreaChart
	data={[]}
	config={chartConfig}
	class="h-full w-full p-4"
	isLoading={true}
	stackType="stacked"
	curveType="bump"
>
	<EChartsAreaChart.Grid />
	<EChartsAreaChart.XAxis
		dataKey="month"
		tickFormatter={(value) => String(value).substring(0, 3)}
	/>
	<EChartsAreaChart.YAxis dataKey="desktop" />
	<EChartsAreaChart.Legend isClickable />
	<EChartsAreaChart.Tooltip />
	<EChartsAreaChart.Area dataKey="desktop" variant="gradient" isClickable>
		<EChartsAreaChart.ActiveDot variant="default" />
	</EChartsAreaChart.Area>
	<EChartsAreaChart.Area dataKey="mobile" variant="gradient" isClickable>
		<EChartsAreaChart.ActiveDot variant="default" />
	</EChartsAreaChart.Area>
</EChartsAreaChart>
