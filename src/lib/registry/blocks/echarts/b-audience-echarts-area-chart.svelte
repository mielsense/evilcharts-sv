<script lang="ts">
	import { EChartsAreaChart } from '../../charts/echarts-area-chart/index.js';
	import type { ChartConfig } from '../../ui/echarts-chart/index.js';

	const data = [
		{ month: 'Jan', listeners: 2980 },
		{ month: 'Feb', listeners: 3120 },
		{ month: 'Mar', listeners: 3460 },
		{ month: 'Apr', listeners: 3380 },
		{ month: 'May', listeners: 3720 },
		{ month: 'Jun', listeners: 4180 },
		{ month: 'Jul', listeners: 4560 }
	];
	const config = {
		listeners: {
			label: 'Listeners',
			colors: { light: ['#10b981', '#0ea5e9', '#8b5cf6'], dark: ['#34d399', '#38bdf8', '#a78bfa'] }
		}
	} satisfies ChartConfig;
	const total = data.reduce((sum, row) => sum + row.listeners, 0);
</script>

<section class="flex h-full w-full flex-col" data-block="audience-area-chart">
	<header class="flex items-start justify-between gap-4 px-4 pt-4">
		<div class="flex flex-col gap-1">
			<span class="text-base font-medium tracking-tight text-primary sm:text-lg">Listeners</span>
			<span class="max-w-[26ch] text-xs leading-snug text-muted-foreground">
				Monthly reach across every show and episode
			</span>
		</div>
		<div class="flex shrink-0 flex-col items-end gap-2">
			<span class="text-2xl font-semibold tracking-tight text-primary sm:text-4xl">
				{total.toLocaleString('en-US')}
			</span>
			<span class="text-xs text-muted-foreground">Total listeners</span>
		</div>
	</header>
	<div class="relative mt-2 min-h-0 w-full flex-1">
		<EChartsAreaChart
			{data}
			{config}
			xDataKey="month"
			class="h-full w-full"
			curveType="monotone"
			chartOptions={{
				grid: { left: 0, right: 0, top: 16, bottom: 0, outerBoundsMode: 'none' },
				yAxis: { type: 'value', show: false, scale: true, boundaryGap: ['16%', '20%'] }
			}}
		>
			<EChartsAreaChart.Tooltip variant="frosted-glass" />
			<EChartsAreaChart.Area
				dataKey="listeners"
				variant="gradient"
				strokeVariant="solid"
				strokeWidth={2.5}
			>
				<EChartsAreaChart.ActiveDot variant="ping" />
			</EChartsAreaChart.Area>
		</EChartsAreaChart>
		<div
			class="pointer-events-none absolute inset-x-0 bottom-0 flex justify-between px-4 pb-3 text-[10px] text-muted-foreground sm:text-xs"
		>
			{#each data as row (row.month)}<span>{row.month}</span>{/each}
		</div>
	</div>
</section>
