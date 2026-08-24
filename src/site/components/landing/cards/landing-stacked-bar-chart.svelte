<script lang="ts">
	/** `LandingStackedBarChart` from the reference's `src/components/landing/landing-chart-cards.tsx`. */
	import { EvilBarChart } from '$lib/registry/charts/layerchart-bar-chart/index.js';
	import { type ChartConfig } from '$lib/registry/ui/layerchart-chart/index.js';

	const monthly3 = [
		{ month: 'Jan', primary: 186, secondary: 120, tertiary: 90 },
		{ month: 'Feb', primary: 305, secondary: 180, tertiary: 130 },
		{ month: 'Mar', primary: 237, secondary: 150, tertiary: 170 },
		{ month: 'Apr', primary: 173, secondary: 210, tertiary: 110 },
		{ month: 'May', primary: 209, secondary: 160, tertiary: 190 },
		{ month: 'Jun', primary: 264, secondary: 200, tertiary: 140 },
		{ month: 'Jul', primary: 232, secondary: 240, tertiary: 180 },
		{ month: 'Aug', primary: 291, secondary: 190, tertiary: 220 }
	];
	const stackedBarConfig = {
		primary: {
			label: 'Seed',
			colors: { light: ['#d97706'], dark: ['#fbbf24'] }
		},
		secondary: {
			label: 'Series A',
			colors: { light: ['#e11d48'], dark: ['#fb7185'] }
		},
		tertiary: {
			label: 'Series B',
			colors: { light: ['#7c3aed'], dark: ['#a78bfa'] }
		}
	} satisfies ChartConfig;
</script>

<EvilBarChart
	data={monthly3}
	config={stackedBarConfig}
	class="h-full w-full p-3"
	stackType="stacked"
>
	<EvilBarChart.Grid />
	<EvilBarChart.XAxis dataKey="month" />
	<EvilBarChart.Tooltip />
	<EvilBarChart.Bar dataKey="primary" />
	<EvilBarChart.Bar dataKey="secondary" />
	<EvilBarChart.Bar dataKey="tertiary" />
</EvilBarChart>
