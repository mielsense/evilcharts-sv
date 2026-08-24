<script lang="ts">
	import { EvilAreaChart } from '../../charts/layerchart-area-chart/index.js';
	import type { ChartConfig } from '../../ui/layerchart-chart/index.js';

	const series = [
		{ key: 'p99', label: 'P99', color: '#d41f12', latest: 204 },
		{ key: 'p95', label: 'P95', color: '#f37a00', latest: 98 },
		{ key: 'p75', label: 'P75', color: '#62c9d4', latest: 46 },
		{ key: 'p50', label: 'P50', color: '#007292', latest: 21 }
	] as const;

	const data = [
		{ time: 'Today 13:06', p99: 188, p95: 92, p75: 44, p50: 20 },
		{ time: 'Today 13:07', p99: 196, p95: 95, p75: 46, p50: 21 },
		{ time: 'Today 13:08', p99: 181, p95: 89, p75: 43, p50: 20 },
		{ time: 'Today 13:09', p99: 192, p95: 94, p75: 47, p50: 22 },
		{ time: 'Today 13:10', p99: 205, p95: 99, p75: 45, p50: 21 },
		{ time: 'Today 13:11', p99: 187, p95: 91, p75: 44, p50: 20 },
		{ time: 'Today 13:12', p99: 179, p95: 88, p75: 42, p50: 19 },
		{ time: 'Today 13:13', p99: 198, p95: 96, p75: 46, p50: 21 },
		{ time: 'Today 13:14', p99: 210, p95: 101, p75: 48, p50: 22 },
		{ time: 'Today 13:15', p99: 194, p95: 93, p75: 45, p50: 21 },
		{ time: 'Today 13:16', p99: 202, p95: 97, p75: 47, p50: 22 },
		{ time: 'Today 13:17', p99: 215, p95: 104, p75: 49, p50: 23 },
		{ time: 'Today 13:18', p99: 231, p95: 112, p75: 52, p50: 23 },
		{ time: 'Today 13:19', p99: 278, p95: 131, p75: 57, p50: 24 },
		{ time: 'Today 13:20', p99: 306, p95: 142, p75: 61, p50: 25 },
		{ time: 'Today 13:21', p99: 289, p95: 135, p75: 58, p50: 24 },
		{ time: 'Today 13:22', p99: 247, p95: 118, p75: 53, p50: 23 },
		{ time: 'Today 13:23', p99: 216, p95: 105, p75: 49, p50: 22 },
		{ time: 'Today 13:24', p99: 201, p95: 97, p75: 46, p50: 21 },
		{ time: 'Today 13:25', p99: 193, p95: 94, p75: 45, p50: 21 },
		{ time: 'Today 13:26', p99: 186, p95: 90, p75: 44, p50: 20 },
		{ time: 'Today 13:27', p99: 199, p95: 96, p75: 46, p50: 21 },
		{ time: 'Today 13:28', p99: 207, p95: 100, p75: 47, p50: 22 },
		{ time: 'Today 13:29', p99: 191, p95: 92, p75: 45, p50: 20 },
		{ time: 'Today 13:30', p99: 184, p95: 89, p75: 43, p50: 20 },
		{ time: 'Today 13:31', p99: 196, p95: 95, p75: 46, p50: 21 },
		{ time: 'Today 13:32', p99: 209, p95: 101, p75: 48, p50: 22 },
		{ time: 'Today 13:33', p99: 198, p95: 96, p75: 46, p50: 21 },
		{ time: 'Today 13:34', p99: 204, p95: 98, p75: 46, p50: 21 }
	];

	const config = {
		p99: { label: 'P99', colors: { light: ['#f87171'], dark: ['#d41f12'] } },
		p95: { label: 'P95', colors: { light: ['#fbbf24'], dark: ['#f37a00'] } },
		p75: { label: 'P75', colors: { light: ['#60a5fa'], dark: ['#62c9d4'] } },
		p50: { label: 'P50', colors: { light: ['#93c5fd'], dark: ['#007292'] } }
	} satisfies ChartConfig;

	let selected = $state<string | null>(null);

	function toggle(key: string) {
		selected = selected === key ? null : key;
	}
</script>

<section
	class="@container/block flex size-full min-h-0 flex-col overflow-hidden p-3 sm:p-4"
	data-block="latency-area-chart"
>
	<div class="grid shrink-0 grid-cols-2 gap-y-2 @sm/block:grid-cols-4">
		{#each series as item (item.key)}
			<button
				type="button"
				onclick={() => toggle(item.key)}
				class="flex min-w-0 items-center gap-1.5 border-border px-2 text-left transition-opacity @sm/block:flex-col @sm/block:items-start @sm/block:gap-1 @sm/block:border-l @sm/block:first:border-l-0"
				class:opacity-35={selected !== null && selected !== item.key}
				aria-pressed={selected === item.key}
			>
				<span class="flex items-center gap-1.5 text-[11px] font-medium text-foreground">
					<span class="size-2 rounded-[2px]" style:background-color={item.color}></span>
					{item.label}
				</span>
				<span class="leading-none">
					<span class="text-sm font-medium tracking-tight @sm/block:text-xl">{item.latest}</span>
					<span class="ml-0.5 text-[10px] text-muted-foreground @sm/block:text-xs">ms</span>
				</span>
			</button>
		{/each}
	</div>

	<div class="mt-2 min-h-0 flex-1 overflow-hidden @sm/block:mt-4">
		{#key selected}
			<EvilAreaChart
				{data}
				{config}
				xDataKey="time"
				class="size-full"
				curveType="linear"
				defaultSelectedDataKey={selected}
				onSelectionChange={(key) => (selected = key)}
			>
				<EvilAreaChart.Grid />
				<EvilAreaChart.XAxis
					dataKey="time"
					tickFormatter={(value) => String(value).replace('Today ', '')}
				/>
				<EvilAreaChart.YAxis />
				<EvilAreaChart.Tooltip />
				<EvilAreaChart.Area dataKey="p50" variant="gradient" strokeVariant="solid" isClickable />
				<EvilAreaChart.Area dataKey="p75" variant="gradient" strokeVariant="solid" isClickable />
				<EvilAreaChart.Area dataKey="p95" variant="gradient" strokeVariant="solid" isClickable />
				<EvilAreaChart.Area dataKey="p99" variant="gradient" strokeVariant="solid" isClickable />
			</EvilAreaChart>
		{/key}
	</div>
</section>
