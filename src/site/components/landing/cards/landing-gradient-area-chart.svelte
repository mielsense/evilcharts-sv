<script lang="ts">
	/** `LandingGradientAreaChart` from the reference's `src/components/landing/landing-chart-cards.tsx`. */
	import { EvilAreaChart } from '$lib/registry/charts/layerchart-area-chart/index.js';
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
	const gradientAreaConfig = {
		primary: {
			label: 'Sessions',
			colors: {
				light: ['#06b6d4', '#3b82f6', '#8b5cf6'],
				dark: ['#22d3ee', '#60a5fa', '#a78bfa']
			}
		},
		secondary: {
			label: 'Signups',
			colors: {
				light: ['#f59e0b', '#f97316'],
				dark: ['#fbbf24', '#fb923c']
			}
		}
	} satisfies ChartConfig;
</script>

<EvilAreaChart
	data={monthly}
	config={gradientAreaConfig}
	class="h-full w-full p-3"
	stackType="stacked"
>
	<EvilAreaChart.Grid />
	<EvilAreaChart.XAxis dataKey="month" />
	<EvilAreaChart.Tooltip />
	<EvilAreaChart.Area dataKey="primary" variant="gradient">
		<EvilAreaChart.ActiveDot variant="default" />
	</EvilAreaChart.Area>
	<EvilAreaChart.Area dataKey="secondary" variant="gradient">
		<EvilAreaChart.ActiveDot variant="default" />
	</EvilAreaChart.Area>
</EvilAreaChart>
