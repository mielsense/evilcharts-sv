<script lang="ts">
	/** `LandingGradientBarChart` from the reference's `src/components/landing/landing-chart-cards.tsx`. */
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
	const gradientBarConfig = {
		primary: {
			label: 'Revenue',
			colors: {
				light: ['#f43f5e', '#ec4899', '#a855f7', '#6366f1', '#3b82f6'],
				dark: ['#fb7185', '#f472b6', '#c084fc', '#818cf8', '#60a5fa']
			}
		},
		secondary: {
			label: 'Profit',
			colors: {
				light: ['#059669', '#14b8a6', '#06b6d4'],
				dark: ['#34d399', '#2dd4bf', '#22d3ee']
			}
		}
	} satisfies ChartConfig;
</script>

<EvilBarChart data={monthly} config={gradientBarConfig} class="h-full w-full p-3">
	<EvilBarChart.Grid />
	<EvilBarChart.XAxis dataKey="month" />
	<EvilBarChart.Tooltip />
	<EvilBarChart.Bar dataKey="primary" />
	<EvilBarChart.Bar dataKey="secondary" />
</EvilBarChart>
