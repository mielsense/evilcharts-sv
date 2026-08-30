<script lang="ts">
	import { EChartsPieChart } from '$lib/registry/charts/echarts-pie-chart/index.js';
	import { type ChartConfig } from '$lib/registry/ui/echarts-chart/index.js';

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
				// [!code highlight:2]
				light: ['#93c5fd', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af'],
				dark: ['#bfdbfe', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8']
			}
		},
		safari: {
			label: 'Safari',
			colors: {
				// [!code highlight:2]
				light: ['#6ee7b7', '#10b981', '#059669', '#047857', '#065f46'],
				dark: ['#a7f3d0', '#34d399', '#10b981', '#059669', '#047857']
			}
		},
		firefox: {
			label: 'Firefox',
			colors: {
				// [!code highlight:2]
				light: ['#fcd34d', '#f59e0b', '#d97706', '#b45309', '#92400e'],
				dark: ['#fde68a', '#fbbf24', '#f59e0b', '#d97706', '#b45309']
			}
		},
		edge: {
			label: 'Edge',
			colors: {
				// [!code highlight:2]
				light: ['#c4b5fd', '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6'],
				dark: ['#ddd6fe', '#a78bfa', '#8b5cf6', '#7c3aed', '#6d28d9']
			}
		},
		other: {
			label: 'Other',
			colors: {
				// [!code highlight:2]
				light: ['#d1d5db', '#9ca3af', '#6b7280', '#4b5563', '#374151'],
				dark: ['#e5e7eb', '#d1d5db', '#9ca3af', '#6b7280', '#4b5563']
			}
		}
	} satisfies ChartConfig;
</script>

<EChartsPieChart
	class="h-full w-full p-4"
	{data}
	dataKey="visitors"
	nameKey="browser"
	config={chartConfig}
>
	<EChartsPieChart.Legend isClickable />
	<EChartsPieChart.Tooltip />
	<EChartsPieChart.Pie isClickable />
</EChartsPieChart>
