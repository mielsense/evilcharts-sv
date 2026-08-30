<script lang="ts">
	import { EChartsLineChart } from '../../charts/echarts-line-chart/index.js';
	import type { ChartConfig } from '../../ui/echarts-chart/index.js';

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
		{
			key: 'current',
			label: 'This week',
			swatch: 'border-[#171717] dark:border-[#fafafa]'
		},
		{
			key: 'previous',
			label: 'Last week',
			swatch: 'border-[#d4d4d4] dark:border-[#525252]'
		}
	];
	const total = data.reduce((sum, row) => sum + row.current, 0);
</script>

<section class="flex h-full w-full flex-col p-4" data-block="shipments-line-chart">
	<header>
		<strong class="text-sm font-medium tracking-tight text-primary">Orders shipped</strong>
		<div class="mt-1 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
			<div class="flex items-baseline gap-2">
				<strong class="text-2xl font-semibold tracking-tight text-primary sm:text-3xl"
					>{total}</strong
				>
				<span class="text-xs font-medium text-emerald-500">+4.2%</span>
				<span class="text-xs text-muted-foreground">vs last week</span>
			</div>
			<div class="flex items-center gap-3">
				{#each legend as item (item.key)}
					<span class="flex items-center gap-1.5 text-[11px] text-muted-foreground sm:text-xs">
						<i class={`size-2.5 shrink-0 rounded-full border-2 ${item.swatch}`}></i>{item.label}
					</span>
				{/each}
			</div>
		</div>
	</header>
	<div class="mt-2 min-h-0 w-full flex-1">
		<EChartsLineChart {data} {config} xDataKey="slot" class="h-full w-full" curveType="linear">
			<EChartsLineChart.Grid />
			<EChartsLineChart.YAxis />
			<EChartsLineChart.XAxis
				dataKey="slot"
				tickFormatter={(value) => (String(value).endsWith(' 1') ? String(value).slice(0, 3) : '')}
			/>
			<EChartsLineChart.Tooltip />
			<EChartsLineChart.Line dataKey="previous" strokeVariant="dashed" strokeWidth={1.5} />
			<EChartsLineChart.Line dataKey="current" strokeVariant="solid" strokeWidth={1.5}>
				<EChartsLineChart.ActiveDot />
			</EChartsLineChart.Line>
		</EChartsLineChart>
	</div>
</section>
