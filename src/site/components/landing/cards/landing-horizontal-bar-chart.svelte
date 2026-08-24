<script lang="ts">
	/** `LandingHorizontalBarChart` from the reference's `src/components/landing/landing-chart-cards.tsx`. */
	import { EvilBarChart } from '$lib/registry/charts/layerchart-bar-chart/index.js';
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
	const horizontalBarConfig = {
		primary: {
			label: 'Imports',
			colors: { light: ['#0891b2'], dark: ['#22d3ee'] }
		},
		secondary: {
			label: 'Exports',
			colors: { light: ['#db2777'], dark: ['#f472b6'] }
		}
	} satisfies ChartConfig;
</script>

<EvilBarChart
	data={monthly}
	config={horizontalBarConfig}
	class="h-full w-full p-3"
	layout="horizontal"
>
	<EvilBarChart.Grid />
	<EvilBarChart.XAxis dataKey="month" />
	<EvilBarChart.Tooltip />
	<EvilBarChart.Bar dataKey="primary" />
	<EvilBarChart.Bar dataKey="secondary" />
</EvilBarChart>
