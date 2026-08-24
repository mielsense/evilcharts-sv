<script lang="ts">
	import { EvilLineChart } from '$lib/registry/charts/layerchart-line-chart/index.js';
	import { type ChartConfig } from '$lib/registry/ui/layerchart-chart/index.js';

	const data = [
		{ month: 'January', desktop: 342, mobile: 245 },
		{ month: 'February', desktop: 876, mobile: 654 },
		{ month: 'March', desktop: 512, mobile: 387 },
		{ month: 'April', desktop: 629, mobile: 521 },
		{ month: 'May', desktop: 458, mobile: 412 },
		{ month: 'June', desktop: 781, mobile: 598 },
		{ month: 'July', desktop: 394, mobile: 312 },
		{ month: 'August', desktop: 925, mobile: 743 },
		{ month: 'September', desktop: 647, mobile: 489 },
		{ month: 'October', desktop: 532, mobile: 476 },
		{ month: 'November', desktop: 803, mobile: 687 },
		{ month: 'December', desktop: 271, mobile: 198 }
	];

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

<EvilLineChart {data} config={chartConfig} class="h-full w-full p-4">
	<EvilLineChart.XAxis dataKey="month" tickFormatter={(value) => String(value).substring(0, 3)} />
	<EvilLineChart.YAxis dataKey="desktop" />
	<EvilLineChart.Legend isClickable />
	<EvilLineChart.Tooltip />
	<!-- [!code highlight:3] -->
	<EvilLineChart.Line dataKey="desktop" strokeVariant="dashed" isClickable>
		<EvilLineChart.ActiveDot variant="default" />
	</EvilLineChart.Line>
	<!-- [!code highlight:3] -->
	<EvilLineChart.Line dataKey="mobile" strokeVariant="dashed" isClickable>
		<EvilLineChart.ActiveDot variant="default" />
	</EvilLineChart.Line>
</EvilLineChart>
