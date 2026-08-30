<script lang="ts">
	import { EChartsLineChart } from '../../charts/echarts-line-chart/index.js';
	import type { ChartConfig } from '../../ui/echarts-chart/index.js';

	const data = [
		{ month: 'Jan', payouts: 312, pending: 548 },
		{ month: 'Feb', payouts: 388, pending: 502 },
		{ month: 'Mar', payouts: 342, pending: 561 },
		{ month: 'Apr', payouts: 455, pending: 470 },
		{ month: 'May', payouts: 521, pending: 398 },
		{ month: 'Jun', payouts: 486, pending: 441 },
		{ month: 'Jul', payouts: 573, pending: 372 },
		{ month: 'Aug', payouts: 640, pending: 316 },
		{ month: 'Sep', payouts: 598, pending: 358 },
		{ month: 'Oct', payouts: 662, pending: 284 },
		{ month: 'Nov', payouts: 617, pending: 331 },
		{ month: 'Dec', payouts: 690, pending: 262 }
	];
	const config = {
		payouts: {
			label: 'Payouts',
			colors: { light: ['#f97316', '#ec4899'], dark: ['#fb923c', '#f472b6'] }
		},
		pending: {
			label: 'Pending',
			colors: { light: ['#0891b2', '#7c3aed'], dark: ['#22d3ee', '#a78bfa'] }
		}
	} satisfies ChartConfig;
	const stats = [
		{
			label: 'Monthly',
			value: '$12,480',
			delta: '+8.4%',
			sub: '11,512 last month',
			color: '#f97316'
		},
		{
			label: 'Yearly',
			value: '$164,320',
			delta: '+3.1%',
			sub: '159,380 last year',
			color: '#ec4899'
		}
	];
	const cities = [
		{ city: 'Berlin', amount: '84,210' },
		{ city: 'Toronto', amount: '61,940' }
	];
</script>

<section
	class="@container/block flex size-full min-h-0 flex-col overflow-hidden px-3 pt-2 pb-1 sm:px-4 sm:pt-4 sm:pb-2"
	data-block="payouts-line-chart"
>
	<div class="min-h-20 flex-1 overflow-hidden">
		<EChartsLineChart {data} {config} xDataKey="month" class="size-full" curveType="monotone">
			<EChartsLineChart.Grid />
			<EChartsLineChart.YAxis />
			<EChartsLineChart.Tooltip variant="frosted-glass" />
			<EChartsLineChart.Line dataKey="payouts" strokeVariant="solid" strokeWidth={2} glowing>
				<EChartsLineChart.ActiveDot variant="colored-border" />
			</EChartsLineChart.Line>
			<EChartsLineChart.Line dataKey="pending" strokeVariant="solid" strokeWidth={2} glowing>
				<EChartsLineChart.ActiveDot variant="colored-border" />
			</EChartsLineChart.Line>
		</EChartsLineChart>
	</div>
	<div class="mt-1.5 grid shrink-0 grid-cols-2 gap-3 @sm/block:mt-3 @sm/block:gap-4">
		{#each stats as stat (stat.label)}
			<div class="flex min-w-0 flex-col">
				<span class="flex items-center gap-1.5 text-[10px] font-medium @sm/block:text-[11px]">
					<i class="size-2 rounded-[3px]" style:background-color={stat.color}></i>{stat.label}
				</span>
				<strong class="text-lg leading-5 tracking-tight @sm/block:text-2xl @sm/block:leading-8"
					>{stat.value}</strong
				>
				<span class="flex min-w-0 gap-1 text-[9px] @sm/block:text-[11px]">
					<b class="font-medium text-emerald-500">{stat.delta}</b>
					<span class="truncate text-muted-foreground">{stat.sub}</span>
				</span>
			</div>
		{/each}
	</div>
	<div class="mt-1 shrink-0 @sm/block:mt-2">
		{#each cities as row, index (row.city)}
			<div
				class="flex items-center justify-between py-0.5 text-[10px] @sm/block:py-1 @sm/block:text-xs"
				class:border-t={index > 0}
			>
				<span class="text-muted-foreground">{row.city}</span><span class="font-medium"
					>{row.amount}</span
				>
			</div>
		{/each}
	</div>
</section>
