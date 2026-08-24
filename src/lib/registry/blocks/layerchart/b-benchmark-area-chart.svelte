<script lang="ts">
	import { EvilAreaChart } from '../../charts/layerchart-area-chart/index.js';
	import type { ChartConfig } from '../../ui/layerchart-chart/index.js';

	const data = [
		{ date: 'Jan 1', actual: 240, target: 125 },
		{ date: 'Jan 8', actual: 240, target: 125 },
		{ date: 'Jan 15', actual: 175, target: 200 },
		{ date: 'Jan 22', actual: 175, target: 200 },
		{ date: 'Feb 1', actual: 175, target: 200 },
		{ date: 'Feb 8', actual: 260, target: 125 },
		{ date: 'Feb 15', actual: 260, target: 125 },
		{ date: 'Feb 22', actual: 260, target: 125 },
		{ date: 'Mar 1', actual: 260, target: 190 },
		{ date: 'Mar 8', actual: 335, target: 190 },
		{ date: 'Mar 15', actual: 335, target: 190 },
		{ date: 'Mar 22', actual: 335, target: 390 },
		{ date: 'Apr 1', actual: 335, target: 390 },
		{ date: 'Apr 8', actual: 335, target: 390 },
		{ date: 'Apr 15', actual: 190, target: 390 },
		{ date: 'Apr 22', actual: 215, target: 305 },
		{ date: 'May 1', actual: 215, target: 305 },
		{ date: 'May 8', actual: 215, target: 175 },
		{ date: 'May 15', actual: 215, target: 175 },
		{ date: 'May 22', actual: 275, target: 175 },
		{ date: 'Jun 1', actual: 275, target: 245 }
	];
	const config = {
		actual: { label: 'Actual', colors: { light: ['#0a0a0a'], dark: ['#ffffff'] } },
		target: { label: 'Target', colors: { light: ['#a1a1aa'], dark: ['#666666'] } }
	} satisfies ChartConfig;
	const latest = data.at(-1)!;
	const delta = ((latest.actual - latest.target) / latest.target) * 100;
</script>

<section
	class="flex size-full min-h-0 flex-col overflow-hidden p-3 sm:p-4"
	data-block="benchmark-area-chart"
>
	<header class="flex shrink-0 items-start justify-between gap-4">
		<div class="flex flex-col gap-0.5">
			<span class="text-[11px] text-muted-foreground">Weekly signups</span>
			<div class="flex items-baseline gap-2">
				<strong class="text-2xl tracking-tight sm:text-3xl">{latest.actual}</strong>
				<span class="text-[11px] font-medium text-emerald-500 sm:text-sm"
					>+{delta.toFixed(1)}% vs target</span
				>
			</div>
		</div>
		<div class="flex flex-col items-end gap-1 pt-1 text-[10px] text-muted-foreground sm:text-xs">
			<span class="flex items-center gap-2"><i class="h-0.5 w-4 bg-foreground"></i>Actual</span>
			<span class="flex items-center gap-2"><i class="w-4 border-t border-dashed"></i>Target</span>
		</div>
	</header>
	<div class="mt-2 min-h-0 flex-1 overflow-hidden sm:mt-4">
		<EvilAreaChart {data} {config} xDataKey="date" class="size-full" curveType="monotone">
			<EvilAreaChart.Grid />
			<EvilAreaChart.XAxis
				dataKey="date"
				tickFormatter={(value) => (String(value).endsWith(' 1') ? String(value).split(' ')[0] : '')}
			/>
			<EvilAreaChart.YAxis />
			<EvilAreaChart.Tooltip />
			<EvilAreaChart.Area dataKey="target" variant="solid" strokeVariant="dashed" />
			<EvilAreaChart.Area dataKey="actual" variant="lines" strokeVariant="solid" />
		</EvilAreaChart>
	</div>
</section>
