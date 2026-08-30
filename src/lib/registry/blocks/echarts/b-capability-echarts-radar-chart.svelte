<script lang="ts">
	import { EChartsRadarChart } from '$lib/registry/charts/echarts-radar-chart/index.js';
	import { type ChartConfig } from '$lib/registry/ui/echarts-chart/index.js';

	const data = [
		{ capability: 'Velocity', current: 84, target: 92 },
		{ capability: 'Quality', current: 91, target: 88 },
		{ capability: 'Discovery', current: 68, target: 86 },
		{ capability: 'Operations', current: 77, target: 82 },
		{ capability: 'Focus', current: 88, target: 90 },
		{ capability: 'Resilience', current: 73, target: 84 }
	];
	const config = {
		current: { label: 'Current', colors: { light: ['#ff3e00'], dark: ['#ff6a36'] } },
		target: { label: 'Target', colors: { light: ['#71717a'], dark: ['#a1a1aa'] } }
	} satisfies ChartConfig;
	const score = Math.round(data.reduce((sum, row) => sum + row.current, 0) / data.length);
	const strongest = data.reduce((best, row) => (row.current > best.current ? row : best));
</script>

<div class="@container flex h-full w-full min-w-0 flex-col overflow-hidden p-3 sm:p-4">
	<div class="flex shrink-0 items-start justify-between gap-3">
		<div class="min-w-0">
			<p class="text-[10px] tracking-[0.18em] text-[#ff3e00] uppercase">Project Atlas</p>
			<h3 class="truncate text-base font-medium tracking-tight text-primary sm:text-lg">
				Capability map
			</h3>
		</div>
		<div class="text-right">
			<p class="text-2xl leading-none font-semibold tracking-tight text-primary sm:text-3xl">
				{score}
			</p>
			<p class="mt-1 text-[9px] tracking-wide text-muted-foreground uppercase">team score</p>
		</div>
	</div>

	<div class="mt-1 min-h-0 flex-1">
		<EChartsRadarChart {data} {config} class="h-full w-full">
			<EChartsRadarChart.PolarGrid gridType="circle" />
			<EChartsRadarChart.PolarAngleAxis dataKey="capability" />
			<EChartsRadarChart.Tooltip />
			<EChartsRadarChart.Radar dataKey="target" variant="lines" strokeVariant="dashed" />
			<EChartsRadarChart.Radar dataKey="current" variant="filled" glowing>
				<EChartsRadarChart.Dot variant="colored-border" />
				<EChartsRadarChart.ActiveDot variant="default" />
			</EChartsRadarChart.Radar>
		</EChartsRadarChart>
	</div>

	<div class="grid shrink-0 grid-cols-3 divide-x border-t pt-2 text-center sm:pt-3">
		<div class="px-1">
			<p class="text-sm font-semibold text-primary">{strongest.current}</p>
			<p class="truncate text-[9px] text-muted-foreground sm:text-[10px]">
				Strongest · {strongest.capability}
			</p>
		</div>
		<div class="px-1">
			<p class="text-sm font-semibold text-[#ff3e00]">+6</p>
			<p class="truncate text-[9px] text-muted-foreground sm:text-[10px]">Since last review</p>
		</div>
		<div class="px-1">
			<p class="text-sm font-semibold text-primary">Q2</p>
			<p class="truncate text-[9px] text-muted-foreground sm:text-[10px]">Review window</p>
		</div>
	</div>
</div>
