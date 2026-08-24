<script lang="ts">
	import { EvilLineChart } from '../../charts/layerchart-line-chart/index.js';
	import type { ChartConfig } from '../../ui/layerchart-chart/index.js';

	const data = [
		{ slot: 'Mon 1', current: 14, previous: 34 },
		{ slot: 'Mon 2', current: 9, previous: 41 },
		{ slot: 'Mon 3', current: 18, previous: 37 },
		{ slot: 'Mon 4', current: 26, previous: 29 },
		{ slot: 'Tue 1', current: 31, previous: 24 },
		{ slot: 'Tue 2', current: 27, previous: 33 },
		{ slot: 'Tue 3', current: 19, previous: 45 },
		{ slot: 'Tue 4', current: 12, previous: 52 },
		{ slot: 'Wed 1', current: 16, previous: 47 },
		{ slot: 'Wed 2', current: 22, previous: 39 },
		{ slot: 'Wed 3', current: 15, previous: 44 },
		{ slot: 'Wed 4', current: 11, previous: 50 },
		{ slot: 'Thu 1', current: 17, previous: 43 },
		{ slot: 'Thu 2', current: 24, previous: 31 },
		{ slot: 'Thu 3', current: 20, previous: 26 },
		{ slot: 'Thu 4', current: 13, previous: 22 },
		{ slot: 'Fri 1', current: 21, previous: 28 },
		{ slot: 'Fri 2', current: 29, previous: 36 },
		{ slot: 'Fri 3', current: 34, previous: 42 },
		{ slot: 'Fri 4', current: 28, previous: 55 },
		{ slot: 'Sat 1', current: 23, previous: 49 },
		{ slot: 'Sat 2', current: 30, previous: 40 },
		{ slot: 'Sat 3', current: 36, previous: 35 },
		{ slot: 'Sat 4', current: 32, previous: 44 }
	];
	const config = {
		current: { label: 'This week', colors: { light: ['#171717'], dark: ['#fafafa'] } },
		previous: { label: 'Last week', colors: { light: ['#d4d4d4'], dark: ['#525252'] } }
	} satisfies ChartConfig;
	const legend = [
		{ label: 'This week', color: '#fafafa' },
		{ label: 'Last week', color: '#525252' }
	];
	const total = data.reduce((sum, row) => sum + row.current, 0);
</script>

<section
	class="flex size-full min-h-0 flex-col overflow-hidden p-3 sm:p-4"
	data-block="shipments-line-chart"
>
	<header class="shrink-0">
		<strong class="text-sm font-medium tracking-tight">Orders shipped</strong>
		<div class="mt-0.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
			<div class="flex items-baseline gap-1.5">
				<strong class="text-2xl tracking-tight sm:text-3xl">{total}</strong>
				<span class="text-[10px] font-medium text-emerald-500 sm:text-xs">+4.2%</span>
				<span class="text-[10px] text-muted-foreground sm:text-xs">vs last week</span>
			</div>
			<div class="flex gap-2 sm:gap-3">
				{#each legend as item (item.label)}
					<span class="flex items-center gap-1 text-[10px] text-muted-foreground sm:text-xs">
						<i class="size-2 rounded-full border-2" style:border-color={item.color}></i>{item.label}
					</span>
				{/each}
			</div>
		</div>
	</header>
	<div class="mt-1 min-h-0 flex-1 overflow-hidden sm:mt-2">
		<EvilLineChart {data} {config} xDataKey="slot" class="size-full" curveType="linear">
			<EvilLineChart.Grid />
			<EvilLineChart.YAxis />
			<EvilLineChart.XAxis
				dataKey="slot"
				tickFormatter={(value) => (String(value).endsWith(' 1') ? String(value).slice(0, 3) : '')}
			/>
			<EvilLineChart.Tooltip />
			<EvilLineChart.Line dataKey="previous" strokeVariant="dashed" strokeWidth={1.5} />
			<EvilLineChart.Line dataKey="current" strokeVariant="solid" strokeWidth={1.5}>
				<EvilLineChart.ActiveDot />
			</EvilLineChart.Line>
		</EvilLineChart>
	</div>
</section>
