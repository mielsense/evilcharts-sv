<script lang="ts">
	import { EChartsPieChart } from '$lib/registry/charts/echarts-pie-chart/index.js';
	import { type ChartConfig } from '$lib/registry/ui/echarts-chart/index.js';

	const data = [
		{
			channel: 'direct',
			label: 'Direct',
			value: 52400,
			swatch: 'bg-[#7c3aed] dark:bg-[#a78bfa]'
		},
		{
			channel: 'marketplace',
			label: 'Marketplace',
			value: 38900,
			swatch: 'bg-[#4f46e5] dark:bg-[#818cf8]'
		},
		{
			channel: 'wholesale',
			label: 'Wholesale',
			value: 24150,
			swatch: 'bg-[#0284c7] dark:bg-[#38bdf8]'
		},
		{
			channel: 'affiliate',
			label: 'Affiliate',
			value: 16300,
			swatch: 'bg-[#059669] dark:bg-[#34d399]'
		}
	];

	const config = {
		direct: {
			label: 'Direct',
			colors: { light: ['#7c3aed', '#a855f7'], dark: ['#a78bfa', '#c4b5fd'] }
		},
		marketplace: {
			label: 'Marketplace',
			colors: { light: ['#4f46e5', '#6366f1'], dark: ['#818cf8', '#a5b4fc'] }
		},
		wholesale: {
			label: 'Wholesale',
			colors: { light: ['#0284c7', '#0ea5e9'], dark: ['#38bdf8', '#7dd3fc'] }
		},
		affiliate: {
			label: 'Affiliate',
			colors: { light: ['#059669', '#10b981'], dark: ['#34d399', '#6ee7b7'] }
		}
	} satisfies ChartConfig;
	const orders = 1284;
	const money = (value: number) => value.toLocaleString('en-US');
</script>

<div class="flex h-full w-full items-center gap-3 p-4 sm:gap-6">
	<div class="relative aspect-square w-[40%] max-w-72 shrink-0">
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
				class="flex aspect-square w-[56%] flex-col items-center justify-center rounded-full border border-dashed border-border"
			>
				<span class="text-lg leading-none font-semibold tracking-tight text-primary sm:text-2xl"
					>{money(orders)}</span
				>
				<span class="mt-1 text-[10px] text-muted-foreground sm:text-xs">Total orders</span>
			</div>
		</div>
	</div>

	<div class="flex min-h-0 min-w-0 flex-1 flex-col justify-center">
		{#each data as item (item.channel)}
			<div class="flex items-center gap-2 py-1.5 sm:py-2">
				<span class={`size-2.5 shrink-0 rounded-[3px] ${item.swatch}`}></span>
				<span class="truncate text-xs text-muted-foreground">{item.label}</span>
				<span class="ml-auto text-xs font-semibold text-primary">${money(item.value)}</span>
			</div>
		{/each}
	</div>
</div>
