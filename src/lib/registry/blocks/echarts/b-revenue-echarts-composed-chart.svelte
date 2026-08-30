<script lang="ts">
	import { EChartsComposedChart } from '../../charts/echarts-composed-chart/index.js';
	import type { ChartConfig } from '../../ui/echarts-chart/index.js';

	const data = [
		{ month: 'January', revenue: 4200, profit: 1800 },
		{ month: 'February', revenue: 5800, profit: 2400 },
		{ month: 'March', revenue: 4100, profit: 1600 },
		{ month: 'April', revenue: 6200, profit: 2800 },
		{ month: 'May', revenue: 5400, profit: 2200 },
		{ month: 'June', revenue: 7800, profit: 3400 },
		{ month: 'July', revenue: 6100, profit: 2600 },
		{ month: 'August', revenue: 8200, profit: 3800 },
		{ month: 'September', revenue: 5900, profit: 2500 },
		{ month: 'October', revenue: 6800, profit: 3000 },
		{ month: 'November', revenue: 7200, profit: 3200 },
		{ month: 'December', revenue: 9100, profit: 4200 }
	];
	const config = {
		revenue: { label: 'Revenue', colors: { light: ['#3b82f6'], dark: ['#6a5acd'] } },
		profit: { label: 'Profit', colors: { light: ['#10b981'], dark: ['#34d399'] } }
	} satisfies ChartConfig;
	const latest = data.at(-1)!;
	const annualRevenue = data.reduce((sum, row) => sum + row.revenue, 0);
	const annualProfit = data.reduce((sum, row) => sum + row.profit, 0);
	const compactMoney = (value: number) => `$${(value / 1000).toFixed(1)}k`;
</script>

<section
	class="@container/block flex size-full min-h-0 flex-col overflow-hidden p-3 sm:p-4"
	data-block="revenue-composed-chart"
>
	<header
		class="grid shrink-0 grid-cols-[1fr_auto_auto] items-end gap-3 border-b pb-2 @sm/block:gap-6 @sm/block:pb-3"
	>
		<div class="min-w-0">
			<span class="block truncate text-[10px] tracking-[0.16em] text-muted-foreground uppercase"
				>Revenue and profit</span
			>
			<strong class="text-xl tracking-tight @sm/block:text-3xl"
				>{compactMoney(annualRevenue)}</strong
			>
			<span class="ml-1 text-[10px] text-muted-foreground @sm/block:text-xs">this year</span>
		</div>
		<div class="text-right">
			<span class="block text-[9px] text-muted-foreground @sm/block:text-[11px]"
				>December revenue</span
			>
			<strong class="text-sm @sm/block:text-lg">{compactMoney(latest.revenue)}</strong>
		</div>
		<div class="text-right">
			<span class="block text-[9px] text-muted-foreground @sm/block:text-[11px]"
				>December profit</span
			>
			<strong class="text-sm text-emerald-500 @sm/block:text-lg"
				>{compactMoney(latest.profit)}</strong
			>
		</div>
	</header>
	<div class="mt-2 min-h-0 flex-1 overflow-hidden">
		<EChartsComposedChart {data} {config} xDataKey="month" class="size-full" curveType="monotone">
			<EChartsComposedChart.Grid />
			<EChartsComposedChart.XAxis
				dataKey="month"
				tickFormatter={(value) => String(value).slice(0, 3)}
			/>
			<EChartsComposedChart.YAxis />
			<EChartsComposedChart.Tooltip />
			<EChartsComposedChart.Bar dataKey="revenue" variant="gradient" radius={3} isClickable />
			<EChartsComposedChart.Line dataKey="profit" strokeVariant="solid" glow isClickable>
				<EChartsComposedChart.ActiveDot variant="colored-border" />
			</EChartsComposedChart.Line>
		</EChartsComposedChart>
	</div>
	<footer
		class="flex shrink-0 justify-end gap-3 pt-1 text-[9px] text-muted-foreground @sm/block:text-[11px]"
	>
		<span
			>Annual profit <b class="font-medium text-foreground">{compactMoney(annualProfit)}</b></span
		>
		<span
			>Margin <b class="font-medium text-emerald-500"
				>{((annualProfit / annualRevenue) * 100).toFixed(1)}%</b
			></span
		>
	</footer>
</section>
