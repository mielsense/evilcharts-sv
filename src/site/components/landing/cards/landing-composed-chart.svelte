<script lang="ts">
	/** `LandingComposedChart` from the reference's `src/components/landing/landing-chart-cards.tsx`. */
	import { EvilComposedChart } from '$lib/registry/charts/layerchart-composed-chart/index.js';
	import { type ChartConfig } from '$lib/registry/ui/layerchart-chart/index.js';

	const composedData = [
		{ month: 'Jan', volume: 4200, trend: 1800 },
		{ month: 'Feb', volume: 5800, trend: 2400 },
		{ month: 'Mar', volume: 4100, trend: 1600 },
		{ month: 'Apr', volume: 6200, trend: 2800 },
		{ month: 'May', volume: 5400, trend: 2200 },
		{ month: 'Jun', volume: 7800, trend: 3400 },
		{ month: 'Jul', volume: 6100, trend: 2600 },
		{ month: 'Aug', volume: 8200, trend: 3800 },
		{ month: 'Sep', volume: 5900, trend: 2500 },
		{ month: 'Oct', volume: 6800, trend: 3000 },
		{ month: 'Nov', volume: 7200, trend: 3200 },
		{ month: 'Dec', volume: 9100, trend: 4200 }
	];
	const composedConfig = {
		volume: {
			label: 'Volume',
			colors: {
				light: ['#0284c7', '#4f46e5'],
				dark: ['#38bdf8', '#818cf8']
			}
		},
		trend: {
			label: 'Trend',
			colors: {
				light: ['#ea580c', '#db2777'],
				dark: ['#fb923c', '#f472b6']
			}
		}
	} satisfies ChartConfig;
</script>

<EvilComposedChart
	data={composedData}
	config={composedConfig}
	xDataKey="month"
	class="h-full w-full p-3"
>
	<EvilComposedChart.Grid />
	<EvilComposedChart.XAxis dataKey="month" />
	<EvilComposedChart.Tooltip />
	<EvilComposedChart.Bar dataKey="volume" />
	<EvilComposedChart.Line dataKey="trend" />
</EvilComposedChart>
