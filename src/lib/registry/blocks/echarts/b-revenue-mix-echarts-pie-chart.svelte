<script lang="ts">
	import { EChartsPieChart } from '$lib/registry/charts/echarts-pie-chart/index.js';
	import { type ChartConfig } from '$lib/registry/ui/echarts-chart/index.js';

	const data = [
		{ channel: 'direct', label: 'Direct', value: 52400, color: '#7c3aed' },
		{ channel: 'marketplace', label: 'Marketplace', value: 38900, color: '#4f46e5' },
		{ channel: 'wholesale', label: 'Wholesale', value: 24150, color: '#0284c7' },
		{ channel: 'affiliate', label: 'Affiliate', value: 16300, color: '#059669' }
	];

	const config = Object.fromEntries(
		data.map(({ channel, label, color }) => [
			channel,
			{ label, colors: { light: [color], dark: [color] } }
		])
	) satisfies ChartConfig;
	const orders = 1284;
	const money = (value: number) => value.toLocaleString('en-US');
</script>

<div
	class="@container flex h-full w-full min-w-0 items-center gap-2 overflow-hidden p-3 sm:p-4 @sm:gap-4"
>
	<div class="relative aspect-square w-[43%] max-w-72 shrink-0">
		<EChartsPieChart {data} {config} dataKey="value" nameKey="channel" class="h-full w-full">
			<EChartsPieChart.Tooltip />
			<EChartsPieChart.Pie
				innerRadius="62%"
				outerRadius="92%"
				paddingAngle={6}
				cornerRadius={12}
				startAngle={90}
				endAngle={-270}
			/>
		</EChartsPieChart>

		<div class="pointer-events-none absolute inset-0 flex items-center justify-center">
			<div
				class="flex aspect-square w-[56%] flex-col items-center justify-center rounded-full border border-dashed"
			>
				<span class="text-base leading-none font-semibold tracking-tight text-primary @sm:text-2xl"
					>{money(orders)}</span
				>
				<span class="mt-1 text-center text-[9px] text-muted-foreground @sm:text-xs"
					>Total orders</span
				>
			</div>
		</div>
	</div>

	<div class="flex min-h-0 min-w-0 flex-1 flex-col justify-center">
		{#each data as item (item.channel)}
			<div class="flex min-w-0 items-center gap-1.5 py-1.5 @sm:gap-2 @sm:py-2">
				<span class="size-2.5 shrink-0 rounded-[3px]" style:background={item.color}></span>
				<span class="truncate text-[10px] text-muted-foreground @sm:text-xs">{item.label}</span>
				<span class="ml-auto shrink-0 text-[10px] font-semibold text-primary @sm:text-xs"
					>${money(item.value)}</span
				>
			</div>
		{/each}
	</div>
</div>
