<script lang="ts">
	/** `LandingStepLineChart` from the reference's `src/components/landing/landing-chart-cards.tsx`. */
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
	const stepLineConfig = {
		primary: {
			label: 'Active users',
			colors: { light: ['#0284c7'], dark: ['#38bdf8'] }
		},
		secondary: {
			label: 'New users',
			colors: { light: ['#ea580c'], dark: ['#fb923c'] }
		}
	} satisfies ChartConfig;
</script>

<EvilLineChart data={monthly} config={stepLineConfig} class="h-full w-full p-3" curveType="step">
	<EvilLineChart.Grid />
	<EvilLineChart.XAxis dataKey="month" />
	<EvilLineChart.Tooltip />
	<EvilLineChart.Line dataKey="primary" strokeVariant="solid" strokeWidth={2} />
	<EvilLineChart.Line dataKey="secondary" strokeVariant="solid" strokeWidth={2} />
</EvilLineChart>
