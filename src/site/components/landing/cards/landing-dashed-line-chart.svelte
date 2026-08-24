<script lang="ts">
	/** `LandingDashedLineChart` from the reference's `src/components/landing/landing-chart-cards.tsx`. */
	import { EvilLineChart } from '$lib/registry/charts/layerchart-line-chart/index.js';
	import { type ChartConfig } from '$lib/registry/ui/layerchart-chart/index.js';

	const monthly = [
		{ month: 'Jan', primary: 186, secondary: 80 },
		{ month: 'Feb', primary: 305, secondary: 200 },
		{ month: 'Mar', primary: 237, secondary: 120 },
		{ month: 'Apr', primary: 173, secondary: 190 },
		{ month: 'May', primary: 209, secondary: 130 },
		{ month: 'Jun', primary: 264, secondary: 140 },
		{ month: 'Jul', primary: 232, secondary: 178 },
		{ month: 'Aug', primary: 291, secondary: 210 }
	];
	const dashedLineConfig = {
		primary: {
			label: 'This year',
			colors: { light: ['#0891b2'], dark: ['#22d3ee'] }
		},
		secondary: {
			label: 'Last year',
			colors: { light: ['#e11d48'], dark: ['#fb7185'] }
		}
	} satisfies ChartConfig;
</script>

<EvilLineChart
	data={monthly}
	config={dashedLineConfig}
	class="h-full w-full p-3"
	curveType="monotone"
>
	<EvilLineChart.Grid />
	<EvilLineChart.XAxis dataKey="month" />
	<EvilLineChart.Tooltip />
	<EvilLineChart.Line dataKey="primary" strokeVariant="solid" strokeWidth={2}>
		<EvilLineChart.Dot variant="colored-border" />
		<EvilLineChart.ActiveDot variant="default" />
	</EvilLineChart.Line>
	<EvilLineChart.Line dataKey="secondary" strokeVariant="dashed" strokeWidth={2}>
		<EvilLineChart.ActiveDot variant="default" />
	</EvilLineChart.Line>
</EvilLineChart>
