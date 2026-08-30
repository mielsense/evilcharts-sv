<script lang="ts">
	import {
		EChartsBarChart,
		type ChartConfig
	} from '$lib/registry/charts/echarts-bar-chart/index.js';

	const chartData = [
		{ month: 'January', revenue: 28 },
		{ month: 'February', revenue: 34 },
		{ month: 'March', revenue: 22 },
		{ month: 'April', revenue: 41 },
		{ month: 'May', revenue: 47 },
		{ month: 'June', revenue: 31 },
		{ month: 'July', revenue: 38 }
	];

	const chartConfig = {
		revenue: {
			label: 'Revenue',
			colors: { light: ['#18181b'], dark: ['#fafafa'] }
		}
	} satisfies ChartConfig;

	const maxValue = chartData.reduce((maximum, row) => Math.max(maximum, row.revenue), 0);
	const total = chartData.reduce((sum, row) => sum + row.revenue, 0);
	const peak = chartData.find((row) => row.revenue === maxValue)!;
</script>

<div class="flex h-full w-full flex-col p-4">
	<div class="flex flex-row justify-between">
		<div class="flex flex-row">
			<div class="flex flex-col gap-2">
				<span class="font-mono text-xs text-muted-foreground">[$] Total</span>
				<span class="font-mono text-3xl text-primary">
					<span class="text-xl font-normal text-muted-foreground">$</span>
					<span class="tracking-tighter">{total}K</span>
				</span>
			</div>
			<hr class="mx-4 h-full border-l border-dashed" />
			<div class="flex flex-col gap-2">
				<span class="font-mono text-xs text-muted-foreground">[⬆] Peak</span>
				<span class="font-mono text-3xl tracking-tighter text-primary">
					{peak.month.slice(0, 3)}
				</span>
			</div>
		</div>
		<div class="flex flex-col justify-end gap-1">
			<span class="font-mono text-[10px] text-muted-foreground">
				// PROJECTION: <span class="text-primary">ISOMETRIC</span>
			</span>
			<span class="font-mono text-[10px] text-muted-foreground">
				// HIGHLIGHT: <span class="text-primary">MAX</span>
			</span>
		</div>
	</div>
	<hr class="my-4 border-t border-dashed" />
	<div class="min-h-0 w-full flex-1">
		<EChartsBarChart
			data={chartData}
			config={chartConfig}
			xDataKey="month"
			class="h-full w-full"
			barCategoryGap={25}
			enableMaxValueHighlight
		>
			<EChartsBarChart.XAxis dataKey="month" tickFormatter={(value) => String(value).slice(0, 3)} />
			<EChartsBarChart.Tooltip />
			<EChartsBarChart.Bar dataKey="revenue" variant="isometric" enableHoverHighlight />
		</EChartsBarChart>
	</div>
</div>
