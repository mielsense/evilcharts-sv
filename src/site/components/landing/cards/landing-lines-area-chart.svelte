<script lang="ts">
	/** `LandingLinesAreaChart` from the reference's `src/components/landing/landing-chart-cards.tsx`. */
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
	const linesAreaConfig = {
		primary: {
			label: 'Ingest',
			colors: { light: ['#0d9488'], dark: ['#2dd4bf'] }
		},
		secondary: {
			label: 'Egress',
			colors: { light: ['#ea580c'], dark: ['#fb923c'] }
		}
	} satisfies ChartConfig;
</script>

<EvilAreaChart
	data={monthly}
	config={linesAreaConfig}
	class="h-full w-full p-3"
	stackType="stacked"
>
	<EvilAreaChart.Grid />
	<EvilAreaChart.XAxis dataKey="month" />
	<EvilAreaChart.Tooltip />
	<EvilAreaChart.Area dataKey="primary" variant="lines">
		<EvilAreaChart.ActiveDot variant="default" />
	</EvilAreaChart.Area>
	<EvilAreaChart.Area dataKey="secondary" variant="lines">
		<EvilAreaChart.ActiveDot variant="default" />
	</EvilAreaChart.Area>
</EvilAreaChart>
