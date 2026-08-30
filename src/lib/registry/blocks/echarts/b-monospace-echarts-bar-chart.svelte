<script lang="ts">
	import {
		EChartsBarChart,
		type ChartConfig
	} from '$lib/registry/charts/echarts-bar-chart/index.js';

	const chartData = [
		{ month: 'January', desktop: 342 },
		{ month: 'February', desktop: 876 },
		{ month: 'March', desktop: 512 },
		{ month: 'April', desktop: 629 },
		{ month: 'May', desktop: 458 },
		{ month: 'June', desktop: 781 },
		{ month: 'July', desktop: 394 },
		{ month: 'August', desktop: 925 },
		{ month: 'September', desktop: 647 },
		{ month: 'October', desktop: 532 },
		{ month: 'November', desktop: 803 },
		{ month: 'December', desktop: 271 },
		{ month: 'January', desktop: 342 },
		{ month: 'February', desktop: 876 },
		{ month: 'March', desktop: 512 },
		{ month: 'April', desktop: 629 },
		{ month: 'May', desktop: 458 },
		{ month: 'June', desktop: 781 },
		{ month: 'July', desktop: 394 },
		{ month: 'August', desktop: 925 },
		{ month: 'September', desktop: 647 },
		{ month: 'October', desktop: 532 },
		{ month: 'November', desktop: 803 },
		{ month: 'December', desktop: 271 }
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
</script>

<div class="flex h-full w-full flex-col p-4">
	<div class="flex flex-row justify-between">
		<div class="flex flex-row">
			<div class="flex flex-col gap-2">
				<span class="font-mono text-xs text-muted-foreground">[$] Total Sales</span>
				<span class="font-mono text-3xl text-primary">
					<span class="text-xl font-normal text-muted-foreground">$</span>
					<span class="tracking-tighter">14,340</span>
				</span>
			</div>
			<hr class="mx-4 h-full border-l border-dashed" />
			<div class="flex flex-col gap-2">
				<span class="font-mono text-xs text-muted-foreground">[⬆] Top Month</span>
				<span class="font-mono text-3xl text-primary">
					<span class="tracking-tighter">June</span>
				</span>
			</div>
		</div>
		<div class="flex flex-col justify-end gap-1">
			<span class="font-mono text-[10px] text-muted-foreground">
				// X-AXIS: <span class="text-primary">MONTHS</span>
			</span>
			<span class="font-mono text-[10px] text-muted-foreground">
				// Y-AXIS: <span class="text-primary">SALES</span>
			</span>
		</div>
	</div>
	<hr class="my-4 border-t border-dashed" />
	<div class="min-h-0 w-full flex-1">
		<EChartsBarChart data={chartData} config={chartConfig} xDataKey="month" class="h-full w-full">
			<EChartsBarChart.XAxis
				dataKey="month"
				tickFormatter={(value) => String(value).slice(0, 3)}
				hideDots
			/>
			<EChartsBarChart.Bar dataKey="desktop" variant="expandable" />
		</EChartsBarChart>
	</div>
</div>
