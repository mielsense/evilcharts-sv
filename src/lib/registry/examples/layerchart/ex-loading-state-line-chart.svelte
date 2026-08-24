<script lang="ts">
	import { EvilLineChart } from '$lib/registry/charts/layerchart-line-chart/index.js';
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

<!-- [!code highlight:7] -->
<EvilLineChart
	data={[]}
	config={chartConfig}
	class="h-full w-full p-4"
	isLoading={true}
	curveType="bump"
>
	<EvilLineChart.XAxis dataKey="month" tickFormatter={(value) => String(value).substring(0, 3)} />
	<EvilLineChart.YAxis dataKey="desktop" />
	<EvilLineChart.Legend isClickable />
	<EvilLineChart.Tooltip />
	<EvilLineChart.Line dataKey="desktop" strokeVariant="solid" isClickable>
		<EvilLineChart.ActiveDot variant="default" />
	</EvilLineChart.Line>
	<EvilLineChart.Line dataKey="mobile" strokeVariant="solid" isClickable>
		<EvilLineChart.ActiveDot variant="default" />
	</EvilLineChart.Line>
</EvilLineChart>
