<script lang="ts">
	import { EvilAreaChart } from '../../charts/layerchart-area-chart/index.js';
	import type { ChartConfig } from '../../ui/layerchart-chart/index.js';

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

<section class="flex size-full min-h-0 flex-col overflow-hidden" data-block="audience-area-chart">
	<header class="flex shrink-0 items-start justify-between gap-3 px-3 pt-3 sm:px-4 sm:pt-4">
		<div class="flex min-w-0 flex-col gap-1">
			<strong class="text-base font-medium tracking-tight sm:text-lg">Listeners</strong>
			<span class="max-w-[26ch] text-[11px] leading-snug text-muted-foreground sm:text-xs">
				Monthly reach across every show and episode
			</span>
		</div>
		<div class="flex shrink-0 flex-col items-end gap-1">
			<strong class="text-2xl tracking-tight sm:text-4xl">{total.toLocaleString('en-US')}</strong>
			<span class="text-[10px] text-muted-foreground sm:text-xs">Total listeners</span>
		</div>
	</header>
	<div class="relative mt-1 min-h-0 flex-1 overflow-hidden sm:mt-2">
		<EvilAreaChart {data} {config} xDataKey="month" class="size-full" curveType="monotone">
			<EvilAreaChart.Tooltip variant="frosted-glass" />
			<EvilAreaChart.Area
				dataKey="listeners"
				variant="gradient"
				strokeVariant="solid"
				strokeWidth={2.5}
			>
				<EvilAreaChart.ActiveDot variant="colored-border" />
			</EvilAreaChart.Area>
		</EvilAreaChart>
		<div
			class="pointer-events-none absolute inset-x-0 bottom-0 flex justify-between px-3 pb-2 text-[10px] text-muted-foreground sm:px-4 sm:text-xs"
		>
			{#each data as row (row.month)}<span>{row.month}</span>{/each}
		</div>
	</div>
</section>
