<script lang="ts">
	import { EChartsRadialChart } from '$lib/registry/charts/echarts-radial-chart/index.js';
	import { type ChartConfig } from '$lib/registry/ui/echarts-chart/index.js';
	import { MediaQuery } from 'svelte/reactivity';

	const total = 1000;
	const tiers = [
		{ name: 'memory', label: 'L1 Memory', count: 610, color: '#dc2626' },
		{ name: 'regional', label: 'L2 Regional', count: 240, color: '#d97706' },
		{ name: 'overflow', label: 'Edge Overflow', count: 100, color: '#2563eb' },
		{ name: 'origin', label: 'Origin Fetch', count: 50, color: '#94a3b8' }
	];
	const stats = [
		{ name: 'warm', label: 'Served Warm', value: 9150 },
		{ name: 'revalidated', label: 'Revalidated', value: 1280 },
		{ name: 'evictions', label: 'Evictions', value: 412 },
		{ name: 'purges', label: 'Purges', value: 96 }
	];
	const config = Object.fromEntries(
		tiers.map(({ name, label, color }) => [
			name,
			{ label, colors: { light: [color], dark: [color] } }
		])
	) satisfies ChartConfig;
	const data = [...tiers]
		.reverse()
		.map(({ name, count }) => ({ name, share: (count / total) * 100 }));
	const count = (value: number) => value.toLocaleString('en-US');
	const compact = new MediaQuery('(max-width: 639px)');
</script>

<div class="flex h-full w-full min-w-0 flex-col gap-2 p-3 sm:gap-3 sm:p-4">
	<div class="flex min-h-0 min-w-0 flex-1 gap-3 sm:gap-4">
		<div class="relative min-h-0 min-w-0 flex-1 sm:-mb-10">
			<EChartsRadialChart
				{data}
				{config}
				nameKey="name"
				variant="semi"
				max={100}
				innerRadius="38%"
				outerRadius="96%"
				class="h-full w-full"
			>
				<EChartsRadialChart.RadialBar
					dataKey="share"
					barSize={compact.current ? 7 : 13}
					cornerRadius={compact.current ? 4 : 7}
				/>
			</EChartsRadialChart>
		</div>

		<div
			class="grid min-w-0 shrink-0 grid-cols-2 content-center gap-x-4 gap-y-5 sm:w-[40%] sm:max-w-64"
		>
			{#each stats as stat (stat.name)}
				<div class="flex min-w-0 flex-col gap-1">
					<span class="truncate text-xs text-muted-foreground sm:text-sm">{stat.label}</span>
					<span class="text-lg leading-none font-medium text-primary tabular-nums sm:text-xl"
						>{count(stat.value)}</span
					>
				</div>
			{/each}
		</div>
	</div>

	<div
		class="grid shrink-0 grid-cols-2 gap-x-4 gap-y-2 border-t pt-2 sm:grid-cols-4 sm:gap-y-3 sm:pt-3"
	>
		{#each tiers as tier (tier.name)}
			<div class="flex min-w-0 flex-col gap-1">
				<div class="flex min-w-0 items-center gap-1.5">
					<span class="size-2.5 shrink-0 rounded-[3px]" style:background={tier.color}></span>
					<span class="truncate text-xs text-primary">{tier.label}</span>
				</div>
				<span class="text-xs text-muted-foreground tabular-nums"
					>{count(tier.count)}/{count(total)} ({Math.round((tier.count / total) * 100)}%)</span
				>
			</div>
		{/each}
	</div>
</div>
