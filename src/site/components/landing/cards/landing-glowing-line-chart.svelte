<script lang="ts">
	/**
	 * `LandingGlowingLineChart` from the reference's `src/components/landing/landing-chart-cards.tsx`.
	 *
	 * The reference's card asks for `variant="default"`, which only its ECharts dot offers; the
	 * recharts dot this port derives from has `default | border | colored-border`. `default` is what
	 * the reference's own recharts glowing-line example uses.
	 */
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
	const glowingLineConfig = {
		primary: {
			label: 'Requests',
			colors: {
				light: ['#65a30d', '#16a34a'],
				dark: ['#a3e635', '#4ade80']
			}
		},
		secondary: {
			label: 'Cache hits',
			colors: {
				light: ['#c026d3', '#db2777'],
				dark: ['#e879f9', '#f472b6']
			}
		}
	} satisfies ChartConfig;
</script>

<EvilLineChart data={monthly} config={glowingLineConfig} class="h-full w-full p-3">
	<EvilLineChart.Grid />
	<EvilLineChart.XAxis dataKey="month" />
	<EvilLineChart.Tooltip />
	<EvilLineChart.Line dataKey="primary" strokeVariant="solid" glowing>
		<EvilLineChart.ActiveDot variant="default" />
	</EvilLineChart.Line>
	<EvilLineChart.Line dataKey="secondary" strokeVariant="solid" glowing>
		<EvilLineChart.ActiveDot variant="default" />
	</EvilLineChart.Line>
</EvilLineChart>
