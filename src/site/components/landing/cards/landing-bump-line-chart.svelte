<script lang="ts">
	/** `LandingBumpLineChart` from the reference's `src/components/landing/landing-chart-cards.tsx`. */
	import { EvilLineChart } from '$lib/registry/charts/layerchart-line-chart/index.js';
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
	const bumpLineConfig = {
		primary: {
			label: 'Alpha',
			colors: { light: ['#059669'], dark: ['#34d399'] }
		},
		secondary: {
			label: 'Beta',
			colors: { light: ['#d97706'], dark: ['#fbbf24'] }
		},
		tertiary: {
			label: 'Gamma',
			colors: { light: ['#2563eb'], dark: ['#60a5fa'] }
		}
	} satisfies ChartConfig;
</script>

<EvilLineChart data={monthly3} config={bumpLineConfig} class="h-full w-full p-3" curveType="bump">
	<EvilLineChart.Grid />
	<EvilLineChart.XAxis dataKey="month" />
	<EvilLineChart.Tooltip />
	<EvilLineChart.Line dataKey="primary" strokeVariant="solid" strokeWidth={2}>
		<EvilLineChart.Dot variant="default" />
		<EvilLineChart.ActiveDot variant="default" />
	</EvilLineChart.Line>
	<EvilLineChart.Line dataKey="secondary" strokeVariant="solid" strokeWidth={2}>
		<EvilLineChart.Dot variant="default" />
		<EvilLineChart.ActiveDot variant="default" />
	</EvilLineChart.Line>
	<EvilLineChart.Line dataKey="tertiary" strokeVariant="solid" strokeWidth={2}>
		<EvilLineChart.Dot variant="default" />
		<EvilLineChart.ActiveDot variant="default" />
	</EvilLineChart.Line>
</EvilLineChart>
