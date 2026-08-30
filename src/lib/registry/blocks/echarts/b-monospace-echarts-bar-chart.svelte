<script lang="ts">
	import {
		EChartsBarChart,
		type ChartConfig
	} from '$lib/registry/charts/echarts-bar-chart/index.js';

	const data = [
		{ month: "Jan '24", sales: 342 },
		{ month: "Feb '24", sales: 876 },
		{ month: "Mar '24", sales: 512 },
		{ month: "Apr '24", sales: 629 },
		{ month: "May '24", sales: 458 },
		{ month: "Jun '24", sales: 781 },
		{ month: "Jul '24", sales: 394 },
		{ month: "Aug '24", sales: 925 },
		{ month: "Sep '24", sales: 647 },
		{ month: "Oct '24", sales: 532 },
		{ month: "Nov '24", sales: 803 },
		{ month: "Dec '24", sales: 271 },
		{ month: "Jan '25", sales: 388 },
		{ month: "Feb '25", sales: 912 },
		{ month: "Mar '25", sales: 564 },
		{ month: "Apr '25", sales: 671 },
		{ month: "May '25", sales: 499 },
		{ month: "Jun '25", sales: 838 },
		{ month: "Jul '25", sales: 427 },
		{ month: "Aug '25", sales: 968 },
		{ month: "Sep '25", sales: 702 },
		{ month: "Oct '25", sales: 585 },
		{ month: "Nov '25", sales: 861 },
		{ month: "Dec '25", sales: 314 }
	];
	const config = {
		sales: { label: 'Sales', colors: { light: ['#18181b'], dark: ['#fafafa'] } }
	} satisfies ChartConfig;
	const total = data.reduce((sum, row) => sum + row.sales, 0);
	const top = data.reduce((best, row) => (row.sales > best.sales ? row : best), data[0]);
</script>

<div class="flex h-full w-full flex-col p-4">
	<div class="flex flex-row justify-between">
		<div class="flex flex-row">
			<div class="flex flex-col gap-2">
				<span class="font-mono text-xs text-muted-foreground">[$] Total Sales</span>
				<span class="font-mono text-3xl text-primary"
					><span class="text-xl font-normal text-muted-foreground">$</span><span
						class="tracking-tighter">{total.toLocaleString()}</span
					></span
				>
			</div>
			<hr class="mx-4 h-full border-l border-dashed" />
			<div class="flex flex-col gap-2">
				<span class="font-mono text-xs text-muted-foreground">[⬆] Top Month</span>
				<span class="font-mono text-3xl tracking-tighter text-primary">{top.month}</span>
			</div>
		</div>
		<div class="flex flex-col justify-end gap-1">
			<span class="font-mono text-[10px] text-muted-foreground"
				>// X-AXIS: <span class="text-primary">MONTHS</span></span
			>
			<span class="font-mono text-[10px] text-muted-foreground"
				>// Y-AXIS: <span class="text-primary">SALES</span></span
			>
		</div>
	</div>
	<hr class="my-4 border-t border-dashed" />
	<div class="min-h-0 w-full flex-1">
		<EChartsBarChart {data} {config} xDataKey="month" class="h-full w-full">
			<EChartsBarChart.XAxis
				dataKey="month"
				tickFormatter={(value) => String(value).slice(0, 3)}
				hideDots
			/>
			<EChartsBarChart.Bar dataKey="sales" variant="expandable" />
		</EChartsBarChart>
	</div>
</div>
