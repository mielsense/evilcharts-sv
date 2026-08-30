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
			key: 'month',
			label: 'Monthly',
			value: '$12,480',
			delta: '+8.4%',
			sub: '11,512 last month',
			swatch: 'bg-[#f97316] dark:bg-[#fb923c]'
		},
		{
			key: 'year',
			label: 'Yearly',
			value: '$164,320',
			delta: '+3.1%',
			sub: '159,380 last year',
			swatch: 'bg-[#ec4899] dark:bg-[#f472b6]'
		}
	];
	const cities = [
		{ city: 'Berlin', amount: '84,210' },
		{ city: 'Toronto', amount: '61,940' }
	];
</script>

<section
	class="flex h-full w-full flex-col px-3 pt-2 pb-1 sm:px-4 sm:pt-4 sm:pb-2"
	data-block="payouts-line-chart"
>
	<div class="min-h-24 w-full flex-1 sm:min-h-0">
		<EChartsLineChart {data} {config} xDataKey="month" class="h-full w-full" curveType="monotone">
			<EChartsLineChart.Grid />
			<EChartsLineChart.YAxis />
			<EChartsLineChart.Tooltip variant="frosted-glass" />
			<EChartsLineChart.Line dataKey="payouts" strokeVariant="solid" strokeWidth={2} glowing>
				<EChartsLineChart.ActiveDot variant="ping" />
			</EChartsLineChart.Line>
			<EChartsLineChart.Line dataKey="pending" strokeVariant="solid" strokeWidth={2} glowing>
				<EChartsLineChart.ActiveDot variant="ping" />
			</EChartsLineChart.Line>
		</EChartsLineChart>
	</div>
	<div class="mt-2 grid shrink-0 grid-cols-2 gap-3 sm:mt-3 sm:gap-4">
		{#each stats as stat (stat.key)}
			<div class="flex flex-col gap-0.5">
				<span
					class="flex items-center gap-1.5 text-[10px] leading-3.5 font-medium text-primary sm:text-[11px] sm:leading-normal"
				>
					<i class={`size-2 shrink-0 rounded-[3px] ${stat.swatch}`}></i>{stat.label}
				</span>
				<strong
					class="text-xl leading-6 font-semibold tracking-tight text-primary sm:text-2xl sm:leading-8"
					>{stat.value}</strong
				>
				<span
					class="flex items-center gap-1.5 text-[10px] leading-3.5 sm:text-[11px] sm:leading-normal"
				>
					<b class="font-medium text-emerald-500">{stat.delta}</b>
					<span class="text-muted-foreground">{stat.sub}</span>
				</span>
			</div>
		{/each}
	</div>
	<div class="mt-2 shrink-0 sm:mt-3">
		{#each cities as row, index (row.city)}
			<div
				class={[
					'flex items-center justify-between border-border py-1 text-xs sm:py-1.5 sm:text-sm',
					index > 0 && 'border-t'
				]}
			>
				<span class="text-muted-foreground">{row.city}</span><span class="font-medium text-primary"
					>{row.amount}</span
				>
			</div>
		{/each}
	</div>
</section>
