<script lang="ts">
	import NumberFlow from '@number-flow/svelte';
	import {
		EChartsBarChart,
		type BarHoverDatum,
		type ChartConfig
	} from '$lib/registry/charts/echarts-bar-chart/index.js';

	const chartData = [
		{ month: 'January', desktop: 342 },
		{ month: 'February', desktop: 676 },
		{ month: 'March', desktop: 512 },
		{ month: 'April', desktop: 629 },
		{ month: 'May', desktop: 458 },
		{ month: 'June', desktop: 781 },
		{ month: 'July', desktop: 394 },
		{ month: 'August', desktop: 924 },
		{ month: 'September', desktop: 647 },
		{ month: 'October', desktop: 532 },
		{ month: 'November', desktop: 803 },
		{ month: 'December', desktop: 271 },
		{ month: 'January', desktop: 342 },
		{ month: 'February', desktop: 876 },
		{ month: 'March', desktop: 512 },
		{ month: 'April', desktop: 629 }
	];

	const chartConfig = {
		desktop: {
			label: 'Desktop',
			colors: { light: ['#18181b'], dark: ['#fafafa'] }
		}
	} satisfies ChartConfig;

	const maxData = chartData.reduce(
		(max, item, index) =>
			item.desktop > max.value ? { index, month: item.month, value: item.desktop } : max,
		{ index: 0, month: chartData[0].month, value: chartData[0].desktop }
	);
	let hovered = $state<BarHoverDatum | null>(null);
	const selectedData = $derived.by(() => {
		const hover = hovered;
		const row = hover?.row;
		return row && typeof row.desktop === 'number'
			? { index: hover.index, month: String(row.month), value: row.desktop }
			: maxData;
	});
</script>

<div class="flex h-full flex-col p-4">
	<div class="mb-4 flex items-end justify-between">
		<div class="space-y-1">
			<p class="font-mono text-xs text-muted-foreground">[desktop] Value</p>
			<p class="font-mono text-3xl tracking-tighter text-primary">
				<NumberFlow
					value={selectedData.value}
					format={{ style: 'currency', currency: 'USD', currencyDisplay: 'narrowSymbol' }}
				/>
			</p>
		</div>

		<div class="space-y-1 text-right">
			<p class="font-mono text-[10px] text-muted-foreground">[month]</p>
			<p class="font-mono text-xs text-primary">{selectedData.month}</p>
		</div>
	</div>

	<div class="min-h-0 w-full flex-1">
		<EChartsBarChart
			data={chartData}
			config={chartConfig}
			xDataKey="month"
			class="h-full w-full"
			enableMaxValueHighlight
			referenceLine={selectedData.value}
			referenceLineFormatter={(value) => `$${value}`}
			onDataHover={(datum) => (hovered = datum)}
		>
			<EChartsBarChart.XAxis dataKey="month" tickFormatter={(value) => String(value).slice(0, 3)} />
			<EChartsBarChart.Tooltip />
			<EChartsBarChart.Bar dataKey="desktop" radius={4} enableHoverHighlight />
		</EChartsBarChart>
	</div>
</div>
