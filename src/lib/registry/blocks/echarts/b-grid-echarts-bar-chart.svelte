<script lang="ts">
	import {
		EChartsBarChart,
		type ChartConfig
	} from '$lib/registry/charts/echarts-bar-chart/index.js';
	const data = [
		42, 28, 19, 14, 12, 18, 34, 66, 98, 124, 147, 163, 158, 171, 186, 174, 152, 138, 119, 96, 84,
		71, 58, 47
	].map((sessions, hour) => ({ hour: `${String(hour).padStart(2, '0')}:00`, sessions }));
	const config = {
		sessions: { label: 'Sessions', colors: { light: ['#18181b'], dark: ['#FFFFFF'] } }
	} satisfies ChartConfig;
	const total = data.reduce((sum, row) => sum + row.sessions, 0);
	const peak = data.reduce((best, row) => (row.sessions > best.sessions ? row : best), data[0]);
</script>

<div class="flex h-full w-full flex-col p-4">
	<div class="flex flex-row justify-between">
		<div class="flex flex-row">
			<div class="flex flex-col gap-2">
				<span class="font-mono text-xs text-muted-foreground">[Σ] Total</span><span
					class="font-mono text-3xl tracking-tighter text-primary">{total.toLocaleString()}</span
				>
			</div>
			<hr class="mx-4 h-full border-l border-dashed" />
			<div class="flex flex-col gap-2">
				<span class="font-mono text-xs text-muted-foreground">[⬆] Peak</span><span
					class="font-mono text-3xl tracking-tighter text-primary">{peak.hour}</span
				>
			</div>
		</div>
		<div class="flex flex-col justify-end gap-1">
			<span class="font-mono text-[10px] text-muted-foreground"
				>// CELL: <span class="text-primary">1:1</span></span
			><span class="font-mono text-[10px] text-muted-foreground"
				>// TYPE: <span class="text-primary">GRID</span></span
			>
		</div>
	</div>
	<hr class="my-4 border-t border-dashed" />
	<div class="min-h-0 w-full flex-1">
		<EChartsBarChart {data} {config} xDataKey="hour" barCategoryGap={14} class="h-full w-full">
			<EChartsBarChart.XAxis dataKey="hour" hideDots /><EChartsBarChart.Tooltip />
			<EChartsBarChart.Bar dataKey="sessions" variant="blocks" />
		</EChartsBarChart>
	</div>
</div>
