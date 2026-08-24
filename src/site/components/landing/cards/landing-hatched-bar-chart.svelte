<script lang="ts">
	/** `LandingHatchedBarChart` from the reference's `src/components/landing/landing-chart-cards.tsx`. */
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
	const hatchedBarConfig = {
		primary: {
			label: 'Deploys',
			colors: { light: ['#0d9488'], dark: ['#2dd4bf'] }
		},
		secondary: {
			label: 'Rollbacks',
			colors: { light: ['#d97706'], dark: ['#fbbf24'] }
		}
	} satisfies ChartConfig;
</script>

<EvilBarChart data={monthly} config={hatchedBarConfig} class="h-full w-full p-3">
	<EvilBarChart.Grid />
	<EvilBarChart.XAxis dataKey="month" />
	<EvilBarChart.Tooltip />
	<EvilBarChart.Bar dataKey="primary" variant="hatched" />
	<EvilBarChart.Bar dataKey="secondary" variant="hatched" />
</EvilBarChart>
