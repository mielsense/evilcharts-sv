<script lang="ts">
	import {
		EChartsBarChart,
		type ChartConfig
	} from '$lib/registry/charts/echarts-bar-chart/index.js';
	const data = [
		{ week: 'W01', organic: 128, paid: 74 },
		{ week: 'W02', organic: 164, paid: 91 },
		{ week: 'W03', organic: 142, paid: 66 },
		{ week: 'W04', organic: 199, paid: 108 },
		{ week: 'W05', organic: 176, paid: 84 },
		{ week: 'W06', organic: 231, paid: 167 },
		{ week: 'W07', organic: 208, paid: 96 },
		{ week: 'W08', organic: 287, paid: 158 },
		{ week: 'W09', organic: 244, paid: 112 },
		{ week: 'W10', organic: 196, paid: 88 },
		{ week: 'W11', organic: 221, paid: 103 },
		{ week: 'W12', organic: 173, paid: 79 }
	];
	const config = {
		organic: { label: 'Organic', colors: { light: ['#7c3aed'], dark: ['#a78bfa'] } },
		paid: { label: 'Paid', colors: { light: ['#0891b2'], dark: ['#22d3ee'] } }
	} satisfies ChartConfig;
	const peak = data.reduce(
		(best, row) => (row.organic + row.paid > best.organic + best.paid ? row : best),
		data[0]
	);
</script>

<div class="flex h-full w-full flex-col p-4">
	<div class="flex items-start justify-between gap-4">
		<div class="flex flex-col gap-1">
			<span class="text-xs text-muted-foreground">Best week</span>
			<div class="flex items-baseline gap-2">
				<span class="text-2xl font-semibold tracking-tight text-primary sm:text-3xl"
					>{peak.organic + peak.paid}</span
				><span class="text-sm text-muted-foreground">signups in {peak.week}</span>
			</div>
		</div>
		<div class="flex shrink-0 flex-col items-end gap-1.5 pt-1">
			<span class="flex items-center gap-2 text-[11px] text-muted-foreground sm:text-xs"
				><span class="size-2.5 rounded-[3px] bg-[#7c3aed] dark:bg-[#a78bfa]"></span>Organic</span
			><span class="flex items-center gap-2 text-[11px] text-muted-foreground sm:text-xs"
				><span class="size-2.5 rounded-[3px] bg-[#0891b2] dark:bg-[#22d3ee]"></span>Paid</span
			>
		</div>
	</div>
	<div class="mt-3 min-h-0 w-full flex-1">
		<EChartsBarChart
			{data}
			{config}
			xDataKey="week"
			stackType="stacked"
			enableMaxValueHighlight
			class="h-full w-full"
		>
			<EChartsBarChart.XAxis dataKey="week" hideDots /><EChartsBarChart.Tooltip />
			<EChartsBarChart.Bar dataKey="paid" radius={6} /><EChartsBarChart.Bar
				dataKey="organic"
				radius={6}
			/>
		</EChartsBarChart>
	</div>
</div>
