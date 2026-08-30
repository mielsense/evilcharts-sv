<script lang="ts">
	import { EChartsAreaChart } from '../../charts/echarts-area-chart/index.js';
	import type { ChartConfig } from '../../ui/echarts-chart/index.js';

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

<section class="flex h-full w-full flex-col p-4" data-block="benchmark-area-chart">
	<header class="flex items-start justify-between gap-4">
		<div class="flex flex-col gap-1">
			<span class="text-xs text-muted-foreground">Weekly signups</span>
			<div class="flex items-baseline gap-2">
				<span class="text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
					{latest.actual}
				</span>
				<span class="text-sm font-medium text-emerald-500">+{delta.toFixed(1)}% vs target</span>
			</div>
		</div>
		<div class="flex flex-col items-end gap-1.5 pt-1">
			<div class="flex items-center gap-2 text-xs text-muted-foreground">
				<svg class="text-primary" width="18" height="2" viewBox="0 0 18 2" aria-hidden="true">
					<line x1="0" y1="1" x2="18" y2="1" stroke="currentColor" stroke-width="2" />
				</svg>
				Actual
			</div>
			<div class="flex items-center gap-2 text-xs text-muted-foreground">
				<svg width="18" height="2" viewBox="0 0 18 2" aria-hidden="true">
					<line
						x1="0"
						y1="1"
						x2="18"
						y2="1"
						stroke="currentColor"
						stroke-width="2"
						stroke-dasharray="4 3"
					/>
				</svg>
				Target
			</div>
		</div>
	</header>
	<EChartsAreaChart
		{data}
		{config}
		xDataKey="date"
		class="mt-4 min-h-0 w-full flex-1"
		curveType="smooth"
	>
		<EChartsAreaChart.Grid />
		<EChartsAreaChart.XAxis
			dataKey="date"
			tickFormatter={(value) =>
				String(value).split(' ')[1] === '1' ? String(value).split(' ')[0] : ''}
		/>
		<EChartsAreaChart.YAxis />
		<EChartsAreaChart.Tooltip />
		<EChartsAreaChart.Area dataKey="target" variant="none" strokeVariant="dashed" />
		<EChartsAreaChart.Area dataKey="actual" variant="lines" strokeVariant="solid" />
	</EChartsAreaChart>
</section>
