<script lang="ts">
	/** `LandingExpandedAreaChart` from the reference's `src/components/landing/landing-chart-cards.tsx`. */
	import { EvilAreaChart } from '$lib/registry/charts/layerchart-area-chart/index.js';
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
	const expandedAreaConfig = {
		primary: {
			label: 'Web',
			colors: { light: ['#0284c7'], dark: ['#38bdf8'] }
		},
		secondary: {
			label: 'Mobile',
			colors: { light: ['#7c3aed'], dark: ['#a78bfa'] }
		},
		tertiary: {
			label: 'API',
			colors: { light: ['#059669'], dark: ['#34d399'] }
		}
	} satisfies ChartConfig;
</script>

<EvilAreaChart
	data={monthly3}
	config={expandedAreaConfig}
	class="h-full w-full p-3"
	stackType="expanded"
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
	<EvilAreaChart.Area dataKey="tertiary" variant="gradient">
		<EvilAreaChart.ActiveDot variant="default" />
	</EvilAreaChart.Area>
</EvilAreaChart>
