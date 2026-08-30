<script lang="ts">
	import {
		EChartsBarChart,
		type ChartConfig
	} from '$lib/registry/charts/echarts-bar-chart/index.js';

	const chartData = [
		{ month: 'January', desktop: 186 },
		{ month: 'February', desktop: 305 },
		{ month: 'March', desktop: 237 },
		{ month: 'April', desktop: 273 },
		{ month: 'May', desktop: 209 },
		{ month: 'June', desktop: 346 },
		{ month: 'July', desktop: 181 },
		{ month: 'August', desktop: 392 },
		{ month: 'September', desktop: 298 },
		{ month: 'October', desktop: 215 },
		{ month: 'November', desktop: 327 },
		{ month: 'December', desktop: 162 }
	];

	const chartConfig = {
		desktop: {
			label: 'Desktop',
			colors: {
				light: ['#18181b'],
				dark: ['#fafafa']
			}
		}
	} satisfies ChartConfig;

	const total = chartData.reduce((sum, item) => sum + item.desktop, 0);
	const maxData = chartData.reduce(
		(max, item, index) =>
			item.desktop > max.value ? { index, month: item.month, value: item.desktop } : max,
		{ index: 0, month: chartData[0].month, value: chartData[0].desktop }
	);
</script>

<div class="flex h-full w-full flex-col p-4">
	<div class="flex flex-row justify-between">
		<div class="flex flex-row">
			<div class="flex flex-col gap-2">
				<span class="font-mono text-xs text-muted-foreground">[Σ] Total</span>
				<span class="font-mono text-3xl tracking-tighter text-primary">
					{total.toLocaleString()}
				</span>
			</div>
			<hr class="mx-4 h-full border-l border-dashed" />
			<div class="flex flex-col gap-2">
				<span class="font-mono text-xs text-muted-foreground">[⬆] Peak</span>
				<span class="font-mono text-3xl tracking-tighter text-primary">
					{maxData.month.slice(0, 3)}
				</span>
			</div>
		</div>
		<div class="flex flex-col justify-end gap-1">
			<span class="font-mono text-[10px] text-muted-foreground">
				// CELL: <span class="text-primary">10x10px</span>
			</span>
			<span class="font-mono text-[10px] text-muted-foreground">
				// TYPE: <span class="text-primary">GRID</span>
			</span>
		</div>
	</div>
	<hr class="my-4 border-t border-dashed" />
	<div class="min-h-0 w-full flex-1">
		<EChartsBarChart
			data={chartData}
			config={chartConfig}
			xDataKey="month"
			barCategoryGap={14}
			class="h-full w-full"
		>
			<EChartsBarChart.XAxis
				dataKey="month"
				tickFormatter={(value) => String(value).slice(0, 3)}
				hideDots
			/>
			<EChartsBarChart.Tooltip />
			<EChartsBarChart.Bar dataKey="desktop" variant="blocks" />
		</EChartsBarChart>
	</div>
</div>
