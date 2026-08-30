<script lang="ts">
	import { EvilPieChart } from '$lib/registry/charts/layerchart-pie-chart/index.js';
	import { type ChartConfig } from '$lib/registry/ui/layerchart-chart/index.js';

	const data = [
		{ browser: 'chrome', visitors: 275 },
		{ browser: 'safari', visitors: 200 },
		{ browser: 'firefox', visitors: 187 },
		{ browser: 'edge', visitors: 173 },
		{ browser: 'other', visitors: 90 }
	];

	const chartConfig = {
		chrome: {
			label: 'Chrome',
			colors: {
				light: ['#3b82f6'],
				dark: ['#60a5fa']
			}
		},
		safari: {
			label: 'Safari',
			colors: {
				light: ['#10b981'],
				dark: ['#34d399']
			}
		},
		firefox: {
			label: 'Firefox',
			colors: {
				light: ['#f59e0b'],
				dark: ['#fbbf24']
			}
		},
		edge: {
			label: 'Edge',
			colors: {
				light: ['#8b5cf6'],
				dark: ['#a78bfa']
			}
		},
		other: {
			label: 'Other',
			colors: {
				light: ['#6b7280'],
				dark: ['#9ca3af']
			}
		}
	} satisfies ChartConfig;
</script>

<EvilPieChart
	class="h-full w-full p-4"
	{data}
	dataKey="visitors"
	nameKey="browser"
	config={chartConfig}
	accessibility={{
		label: 'Browser visitor share pie chart',
		description: 'Visitor totals for Chrome, Safari, Firefox, Edge, and other browsers.'
	}}
>
	<EvilPieChart.Legend isClickable />
	<EvilPieChart.Tooltip />
	<EvilPieChart.Pie isClickable />
</EvilPieChart>
