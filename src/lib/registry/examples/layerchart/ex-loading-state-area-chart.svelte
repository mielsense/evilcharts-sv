<script lang="ts">
	import { EvilAreaChart } from '$lib/registry/charts/layerchart-area-chart/index.js';
	import { type ChartConfig } from '$lib/registry/ui/layerchart-chart/index.js';

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
<EvilAreaChart
	data={[]}
	config={chartConfig}
	class="h-full w-full p-4"
	isLoading={true}
	stackType="stacked"
	curveType="bump"
>
	<EvilAreaChart.Grid />
	<EvilAreaChart.XAxis dataKey="month" tickFormatter={(value) => String(value).substring(0, 3)} />
	<EvilAreaChart.YAxis dataKey="desktop" />
	<EvilAreaChart.Legend isClickable />
	<EvilAreaChart.Tooltip />
	<EvilAreaChart.Area dataKey="desktop" variant="gradient" isClickable>
		<EvilAreaChart.ActiveDot variant="default" />
	</EvilAreaChart.Area>
	<EvilAreaChart.Area dataKey="mobile" variant="gradient" isClickable>
		<EvilAreaChart.ActiveDot variant="default" />
	</EvilAreaChart.Area>
</EvilAreaChart>
